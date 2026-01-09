import React from 'react';

import { supabase } from '../../lib/supabase';

import Button from '../ui/Button';

import introImg from '../../assets/images/introduce-img.png';

function LeftColumn() {
  return (
    <aside className="left-column">
      <div className="today-box">
        <div className="today-top">
          <span>Today</span>
          <span>260128</span>
        </div>
        <div className="today-top">
          <span>Total</span>
          <span>251020</span>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-photo"><img src={introImg} alt="" /></div>
        <div className="profile-text">
          {/* 여기 자기소개 송이가 나중에 바꾸면 됨 */}
          자기소개 자기소개 자기소개 자기소개<br />
          자기소개 자기소개 자기소개 자기소개<br />
          자기소개 자기소개 자기소개 자기소개
        </div>
      </div>
      <Button
        variant="ghost"
        onClick={() => supabase.auth.signOut()}
      >
        로그아웃
      </Button>
    </aside>
  );
}

export default LeftColumn;