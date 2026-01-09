// src/App.jsx
import React, { useState } from 'react';
import LeftColumn from './components/layout/LeftColumn.jsx';
import RightMenu from './components/layout/RightMenu.jsx';

import Home from "./page/Home.jsx";
import Profile from "./page/Profile.jsx";
import Diary from "./page/Diary.jsx";
import Video from "./page/Video.jsx";
import Guestbook from './components/guestbook/Guestbook.jsx';

function App() {
  const [activeMenu, setActiveMenu] = useState('home');

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

        <main className="center-column">
          {renderContent()}
        </main>

        <RightMenu activeMenu={activeMenu} onChange={setActiveMenu} />
      </div>
    </div>
  );
}

export default App;