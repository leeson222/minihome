import React from 'react';

function LeftColumn() {
  return (
    <aside className="left-column">
      <div className="today-box">
        <div className="today-top">
          <span>Today</span>
          <span>723849</span>
        </div>
        <div className="today-top">
          <span>Total</span>
          <span>723849</span>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-photo">사진</div>
        <div className="profile-text">
          {/* 여기 자기소개 송이가 나중에 바꾸면 됨 */}
          자기소개 자기소개 자기소개 자기소개<br />
          자기소개 자기소개 자기소개 자기소개<br />
          자기소개 자기소개 자기소개 자기소개
        </div>
      </div>
    </aside>
  );
}

export default LeftColumn;