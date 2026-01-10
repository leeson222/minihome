import React from 'react';

import profileImg from '../assets/images/profile-img.gif'

function Profile() {
  return (
    <div className="content-block">
      <h2 className="content-title">프로필</h2>
      <div className="profile-img-wrap">
        <img src={profileImg} alt="" />
      </div>
    </div>
  );
}

export default Profile;