import React from 'react';

const MENUS = [
  { id: 'home', label: '홈' },
  { id: 'profile', label: '프로필' },
  { id: 'diary', label: '다이어리' },
  { id: 'video', label: '동영상' },
  { id: 'guestbook', label: '방명록' },
];

function RightMenu({ activeMenu, onChange }) {
  return (
    <nav className="right-menu">
      {MENUS.map((m) => (
        <button
          key={m.id}
          type="button"
          className={`right-menu-btn ${
            activeMenu === m.id ? 'is-active' : ''
          }`}
          onClick={() => onChange(m.id)}
        >
          {m.label}
        </button>
      ))}
    </nav>
  );
}

export default RightMenu;