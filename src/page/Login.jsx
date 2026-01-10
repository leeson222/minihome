import { useState } from 'react';
import { useRef } from "react";

import { supabase } from '../lib/supabase';
import { audio } from '../lib/audioManager';

import Button from '../components/ui/Button';

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
    else onLogin?.();
  };

  return (
    <div className="login-wrap">
      <div className="login-box">
        <form onSubmit={handleLogin}>
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
          <Button type="submit">로그인</Button>
          {error && <p>{error}</p>}
        </form>
      </div>
    </div>
  );
}
