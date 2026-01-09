import { useState } from 'react';
import { supabase } from '../lib/supabase';

import '../styles/login.css'

import loginLogo from '../assets/images/login-logo.png';

export default function Login({ onLogin }) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: id,
      password: pw,
    });

    if (error) setError('아이디 또는 비밀번호가 틀렸어');
    else onLogin();
  };

  return (
    <div className='login-wrap'>
      <div className="login-box">
        <img src={loginLogo} alt="" />
        <form onSubmit={handleLogin}>
          <div>
            <input
              placeholder="아이디"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
            <button type="submit">로그인</button>
          </div>
          {error && <p>{error}</p>}
        </form>
      </div>
    </div>
  );
}