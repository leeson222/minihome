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

  const bgmUnlockedRef = useRef(false);

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
  
    // 이미 한 번 브금 재생 성공했으면 다시 안 함
    if (bgmUnlockedRef.current) return;
  
    const unlockBgm = async () => {
      bgmUnlockedRef.current = true;
  
      if (!session) {
        await audio.playLoginBgm();
      } else {
        await audio.playMainBgm();
      }
    };
  
    // 👇 첫 사용자 클릭에서만 실행
    window.addEventListener('pointerdown', unlockBgm, { once: true });
  
    return () => {
      window.removeEventListener('pointerdown', unlockBgm);
    };
  }, [authLoading, session]);

  // ✅ 로딩 중엔 깜빡임 방지
  if (authLoading) {
    return <div style={{ padding: 20 }}>Loading…</div>;
  }

  // ✅ 로그인 안 했으면 로그인 화면만
  if (!session) {
    return <Login />;
  }

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
    <div className="app-root">
      <div className="mini-wrapper">
        <LeftColumn />

        <main className="center-column">{renderContent()}</main>

        <RightMenu activeMenu={activeMenu} onChange={setActiveMenu} />
      </div>
    </div>
  );
}
