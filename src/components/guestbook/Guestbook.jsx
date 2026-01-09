// src/components/guestbook/Guestbook.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Guestbook() {
  const [entries, setEntries] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('guestbook')
      .select('id, name, message, created_at')
      .order('created_at', { ascending: false });

    if (!error) setEntries(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const n = name.trim();
    const m = message.trim();
    if (!n || !m) return;

    const { error } = await supabase
      .from('guestbook')
      .insert([{ name: n, message: m }]);

    if (!error) {
      setMessage('');
      await fetchEntries(); // 새로고침
    }
  };

  return (
    <div className="guestbook">
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
          placeholder="각자의 여보에게 방명록을 남겨 주세요"
          value={message}
          rows={3}
          maxLength={200}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" disabled={!name.trim() || !message.trim()}>
          남기기
        </button>
      </form>

      {loading ? (
        <div style={{ padding: 8 }}>불러오는 중…</div>
      ) : (
        <ul className="guestbook-list">
          {entries.map((e) => (
            <li key={e.id} className="guestbook-item">
              <div className="guestbook-item-top">
                <span className="guestbook-item-name">{e.name}</span>
                <span className="guestbook-item-date">
                  {new Date(e.created_at).toLocaleString('ko-KR')}
                </span>
              </div>
              <p className="guestbook-item-text">{e.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
