import React from 'react';

function Diary() {
  return (
    <div className="content-block">
      <h2 className="content-title">update news</h2>
      {/* 여기에 송이가 표/리스트 이런거 꾸미면 됨 */}

      <h2 className="content-title" style={{ marginTop: 24 }}>
        miniroom
      </h2>
      {/* 미니룸 사진 영역도 여기 */}
      <div className="miniroom-box">
        사진
      </div>

      <h2 className="content-title" style={{ marginTop: 24 }}>
        What lover say
      </h2>
      {/* 텍스트 영역 */}
      <p>(일촌명) ... 이런 거 넣는 부분</p>
    </div>
  );
}

export default Diary;