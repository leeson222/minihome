// src/components/guestbook/Guestbook.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';

export default function Guestbook() {
  const [entries, setEntries] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState(null);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('guestbook')
      .select('id, user_id, name, message, created_at')
      .order('created_at', { ascending: false });

    if (!error) setEntries(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    // 내 uid 가져오기
    supabase.auth.getUser().then(({ data }) => {
      setMyUserId(data?.user?.id ?? null);
    });

    fetchEntries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const n = name.trim();
    const m = message.trim();
    if (!n || !m) return;
  
    // ✅ 현재 로그인 유저 uid 가져오기
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const uid = sessionData?.session?.user?.id;
  
    if (sessionError || !uid) {
      console.log('SESSION ERROR:', sessionError);
      alert('로그인이 풀렸어. 다시 로그인해줘');
      return;
    }
  
    // ✅ user_id를 같이 저장
    const { error } = await supabase
      .from('guestbook')
      .insert([{ user_id: uid, name: n, message: m }]);
  
    if (error) {
      console.log('INSERT ERROR:', error);
      alert(`등록 실패: ${error.message}`);
      return;
    }
  
    setMessage('');
    await fetchEntries();
  };
  

  const handleDelete = async (id) => {
    const ok = confirm('이 글 지울 거야?');
    if (!ok) return;
  
    const { error } = await supabase
      .from('guestbook')
      .delete()
      .eq('id', id);
  
    if (error) {
      console.log('DELETE ERROR:', error);
      alert(`삭제 실패: ${error.message}`);
      return;
    }
  
    await fetchEntries();
  };

  return (
    <div className="guestbook">
      <div style={{ fontSize: 10, opacity: 0.6 }}>
        myUserId: {String(myUserId)}
      </div>
      <form className="guestbook-form" onSubmit={handleSubmit}>
        <input
          className="guestbook-input guestbook-name"
          placeholder="닉네임"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="guestbook-input guestbook-message"
          placeholder="각자의 여보에게 하고 싶은 말"
          value={message}
          rows={3}
          maxLength={200}
          onChange={(e) => setMessage(e.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          disabled={!name.trim() || !message.trim()}
        >
          남기기
        </Button>
      </form>

      {loading ? (
        <div style={{ padding: 8 }}>불러오는 중…</div>
      ) : (
        <ul className="guestbook-list">
          {entries.map((e) => {
            const isMine = myUserId && e.user_id === myUserId;

            return (
              <li key={e.id} className="guestbook-item">
                <div className="guestbook-item-top">
                  <div className="guestbook-item-left">
                    <span className="guestbook-item-name">{e.name}</span>
                    <span className="guestbook-item-date">
                      {new Date(e.created_at).toLocaleString('ko-KR')}
                    </span>
                  </div>

                  {isMine && (
                    <Button variant="ghost" onClick={() => handleDelete(e.id)}>
                      삭제
                    </Button>
                  )}
                </div>

                <p className="guestbook-item-text">{e.message}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}