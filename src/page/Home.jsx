import React from 'react';

import WhatLoverSay from '../components/WhatLoverSay/WhatLoverSay.jsx';
import miniroomImg from '../assets/images/miniroom-img.png';

function Home() {
  return (
    <div className="content-block">
      <div className="content-box">
        <h2 className="content-title">update news</h2>
        {/* 여기에 표/리스트 이런거 꾸미면 됨 */}
        <div className="news-wrap">
          <ul className="news-column">
            <li><span className='icon'>기념일</span><span>26.01.18</span><span>리쿠 탄조비 ♡</span></li>
            <li><span className='icon'>기념일</span><span>26.01.27</span><span>D-Day 100 ♡</span></li>
          </ul>
          <ul className="news-column">
            <li><span className='icon'>Day</span><span>26.01.14</span><span>리쿠 유우시 약속</span></li>
            <li><span className='icon'>Day</span><span>26.01.16</span><span>리쿠 혈액 검사</span></li>
            <li><span className='icon'>Day</span><span>26.01.17</span><span>엣찌 ♥</span></li>
          </ul>
          <ul className="news-column">
            <li><span className='icon'>Movie</span><span>26.01.03</span><span>엘리멘탈</span></li>
            <li><span className='icon'>Movie</span><span>26.01.04</span><span>헤어질 결심</span></li>
            <li><span className='icon'>Movie</span><span>26.01.08</span><span>루비 스팍스</span></li>
          </ul>
        </div>
      </div>
      <div className="content-box">
        <h2 className="content-title" style={{ marginTop: 24 }}>
          miniroom
        </h2>
        {/* 미니룸 사진 영역도 여기 */}
        <div className="miniroom-box">
          <img src={miniroomImg} alt="" />
        </div>
      </div>
      <div className="content-box">
        <h2 className="content-title" style={{ marginTop: 24 }}>
          What lover say
        </h2>
        <WhatLoverSay />
      </div>
    </div>
  );
}

export default Home;