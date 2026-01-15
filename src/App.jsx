// src/App.jsx
import { useEffect, useState, useRef } from 'react';
import { supabase } from './lib/supabase'; // 경로 맞춰줘

import LeftColumn from './components/layout/LeftColumn.jsx';
import RightMenu from './components/layout/RightMenu.jsx';

import Home from './page/Home.jsx';
import Profile from './page/Profile.jsx';
import Diary from './page/Diary.jsx';
import Video from './page/Video.jsx';

import Guestbook from './components/guestbook/Guestbook.jsx';
import Login from './page/Login.jsx'; // Login 컴포넌트 경로 맞춰줘

import { audio } from "./lib/audioManager";



export default function App() {

  const unlockBgm = () => {
    if (authLoading) return;
    if (session) audio.ensureMainBgm();
    else audio.ensureLoginBgm();
  };

  const pendingTrackRef = useRef(null); // 'login' | 'main' | null
  const listenerAddedRef = useRef(false);

  // ✅ 로그인 세션
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ✅ 기존 메뉴 상태
  const [activeMenu, setActiveMenu] = useState('home');

  // ✅ 세션 체크 (앱 시작 시 1번 + 상태 변화 구독)
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: subscriptionData } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setAuthLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscriptionData?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;
  
    const desired = session ? 'main' : 'login';
  
    const tryPlay = async () => {
      // 원하는 트랙 즉시 시도
      if (desired === 'main') {
        await audio.playMainBgm();
      } else {
        await audio.playLoginBgm();
      }
    };
  
    // 1) 일단 바로 시도 (자동재생 막히면 소리 안 날 수 있음)
    tryPlay();
  
    // 2) 혹시 자동재생이 막힌 경우 대비: 다음 사용자 클릭에서 "원하는 트랙"을 다시 틀기
    //    (로그인/로그아웃으로 desired가 바뀌면 다음 클릭 때 바뀐 트랙으로 재생됨)
    pendingTrackRef.current = desired;
  
    if (!listenerAddedRef.current) {
      listenerAddedRef.current = true;
  
      const unlockOnNextClick = async () => {
        const track = pendingTrackRef.current;
        if (!track) return;
  
        if (track === 'main') await audio.ensureMainBgm();
        else await audio.ensureLoginBgm();
      };
  
      window.addEventListener('click', unlockOnNextClick);
      return () => window.removeEventListener('click', unlockOnNextClick);
    }
  }, [authLoading, session]);

  // ✅ 로딩 중엔 깜빡임 방지
  if (authLoading) {
    return <div style={{ padding: 20 }}>Loading…</div>;
  }

  // ✅ 로그인 안 했으면 로그인 화면만
  if (!session) {
    return (
      <div onClick={unlockBgm}>
        <Login />
      </div>
    );
  }

  const handleMenuChange = (menu) => {
    const email = session?.user?.email;
  
    if (menu === 'diary' && email === 'guest@guest.local') {
      alert('접근 권한이 없습니다.');
      return;
    }
  
    setActiveMenu(menu);
  };

  // ✅ 로그인 했으면 기존 레이아웃 그대로
  const renderContent = () => {
    switch (activeMenu) {
      case 'home':
        return <Home />;
      case 'profile':
        return <Profile />;
      case 'diary':
        return <Diary />;
      case 'video':
        return <Video />;
      case 'guestbook':
        return (
          <div className="content-block">
            <h2 className="content-title">방명록</h2>
            <Guestbook />
          </div>
        );
      default:
        return null;
    }
  };

  return (
      <div className="app-root" onClick={unlockBgm}>
        <div className="mini-wrapper">
          <LeftColumn />
          <main className="center-column">{renderContent()}</main>
          <RightMenu activeMenu={activeMenu} onChange={handleMenuChange} />
        </div>
      </div>
    );
}
