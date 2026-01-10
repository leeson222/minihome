// src/components/whatLoverSay/WhatLoverSay.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function WhatLoverSay() {
  const [list, setList] = useState([]);
  const [relation, setRelation] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const fetchList = async () => {
    const { data, error } = await supabase
      .from('lover_say')
      .select('id, relation, name, message, created_at')
      .order('created_at', { ascending: false });

    if (!error) setList(data ?? []);
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const r = relation.trim();
    const n = name.trim();
    const m = message.trim();
    if (!r || !n || !m) return;

    const { error } = await supabase
      .from('lover_say')
      .insert([{ relation: r, name: n, message: m }]);

    if (!error) {
      setMessage('');
      await fetchList();
    }
  };

  return (
    <div className="lover-say">
      <form className="lover-form" onSubmit={handleSubmit}>
        <div className="lover-row">
          <input placeholder="일촌명 뭐라고 적을 거야?" value={relation} onChange={(e) => setRelation(e.target.value)} />
          <input placeholder="내 이름은 랑또 ♡" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="lover-row">
          <input placeholder="하고 싶은 말 적어 줘 나는 사랑해" value={message} onChange={(e) => setMessage(e.target.value)} />
          <button type="submit">등록</button>
        </div>
      </form>

      <ul className="lover-list">
        {list.map((it) => (
          <li key={it.id}>
            <span className="lover-relation">({it.relation})</span> {it.name} {it.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
