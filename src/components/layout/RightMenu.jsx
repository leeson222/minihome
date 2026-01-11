import React from 'react';

import Button from '../ui/Button';

const MENUS = [
  { id: 'home', label: '홈' },
  { id: 'profile', label: '프로필' },
  { id: 'diary', label: '다이어리' },
  { id: 'video', label: '사진첩' },
  { id: 'guestbook', label: '방명록' },
];

function RightMenu({ activeMenu, onChange }) {
  return (
    <nav className="right-menu">
      {MENUS.map((m) => (
        <Button
          key={m.id}
          type="button"
          className={`btn right-menu-btn ${
            activeMenu === m.id ? 'is-active' : ''
          }`}
          onClick={() => onChange(m.id)}
        >
          {m.label}
        </Button>
      ))}
    </nav>
  );
}

export default RightMenu;