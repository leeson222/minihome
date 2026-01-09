// src/App.jsx
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase'; // 경로 맞춰줘

import LeftColumn from './components/layout/LeftColumn.jsx';
import RightMenu from './components/layout/RightMenu.jsx';

import Home from './page/Home.jsx';
import Profile from './page/Profile.jsx';
import Diary from './page/Diary.jsx';
import Video from './page/Video.jsx';

import Guestbook from './components/guestbook/Guestbook.jsx';
import Login from './page/Login.jsx'; // Login 컴포넌트 경로 맞춰줘

export default function App() {
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
      }
    );

    return () => {
      mounted = false;
      subscriptionData?.subscription?.unsubscribe();
    };
  }, []);

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
