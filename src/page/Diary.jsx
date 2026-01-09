// src/page/Diary.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';

const NAME_MAP = {
  "kuroneko@loveroom.local": "♥리쿠♥",
  "chatora@loveroom.local": "♡유우시♡",
};

function displayName(email) {
  return NAME_MAP[email] ?? email ?? 'unknown';
}

export default function Diary() {
  const [me, setMe] = useState(null);

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // entry_id -> 댓글 입력값
  const [commentDraft, setCommentDraft] = useState({}); 
  // entry_id -> 댓글 리스트
  const [commentsByEntry, setCommentsByEntry] = useState({});

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('diary_entries')
      .select('id, user_id, author_email, title, content, created_at')
      .order('created_at', { ascending: false });

    if (!error) setEntries(data ?? []);
    setLoading(false);
  };

  const fetchComments = async (entryId) => {
    const { data, error } = await supabase
      .from('diary_comments')
      .select('id, entry_id, user_id, author_email, content, created_at')
      .eq('entry_id', entryId)
      .order('created_at', { ascending: true });

    if (!error) {
      setCommentsByEntry((prev) => ({ ...prev, [entryId]: data ?? [] }));
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setMe(data?.session?.user ?? null);
    });
    fetchEntries();
  }, []);

  useEffect(() => {
    // 글 목록이 바뀌면 댓글도 같이 당겨오기 (간단 버전)
    entries.forEach((e) => fetchComments(e.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]);

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    const t = title.trim();
    const c = content.trim();
    if (!c) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return alert('로그인이 풀렸어. 다시 로그인해줘');

    const { error } = await supabase.from('diary_entries').insert([{
      user_id: user.id,
      author_email: user.email,
      title: t,
      content: c,
    }]);

    if (error) {
      console.log('CREATE ENTRY ERROR:', error);
      alert(`등록 실패: ${error.message}`);
      return;
    }

    setTitle('');
    setContent('');
    await fetchEntries();
  };

  const handleAddComment = async (entryId) => {
    const text = (commentDraft[entryId] ?? '').trim();
    if (!text) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return alert('로그인이 풀렸어. 다시 로그인해줘');

    const { error } = await supabase.from('diary_comments').insert([{
      entry_id: entryId,
      user_id: user.id,
      author_email: user.email,
      content: text,
    }]);

    if (error) {
      console.log('ADD COMMENT ERROR:', error);
      alert(`댓글 실패: ${error.message}`);
      return;
    }

    setCommentDraft((prev) => ({ ...prev, [entryId]: '' }));
    await fetchComments(entryId);
  };

  const handleDeleteEntry = async (entryId) => {
    const ok = confirm('이 글 지울 거야? (댓글도 같이 삭제됨)');
    if (!ok) return;

    const { error } = await supabase.from('diary_entries').delete().eq('id', entryId);
    if (error) {
      console.log('DELETE ENTRY ERROR:', error);
      alert(`삭제 실패: ${error.message}`);
      return;
    }
    await fetchEntries();
  };

  const handleDeleteComment = async (commentId, entryId) => {
    const ok = confirm('댓글 지울 거야?');
    if (!ok) return;

    const { error } = await supabase.from('diary_comments').delete().eq('id', commentId);
    if (error) {
      console.log('DELETE COMMENT ERROR:', error);
      alert(`삭제 실패: ${error.message}`);
      return;
    }
    await fetchComments(entryId);
  };

  return (
    <div className="content-block">
      <h2 className="content-title">다이어리</h2>

      <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 8 }}>
        로그인: {me?.email ? displayName(me.email) : '...'}
      </div>

      {/* 글쓰기 */}
      <form onSubmit={handleCreateEntry} style={{ marginBottom: 16 }}>
        <input
          placeholder="제목(선택)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={50}
          style={{ width: '100%', marginBottom: 6 }}
        />
        <textarea
          placeholder="오늘의 일기…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          maxLength={2000}
          style={{ width: '100%', marginBottom: 6 }}
        />
        <Button type="submit" variant="primary" disabled={!content.trim()}>
          저장
        </Button>
      </form>

      {/* 글 목록 */}
      {loading ? (
        <div style={{ padding: 8 }}>불러오는 중…</div>
      ) : (
        <ul style={{ display: 'grid', gap: 12 }}>
          {entries.map((e) => {
            const isMine = me?.id && e.user_id === me.id;
            const comments = commentsByEntry[e.id] ?? [];

            return (
              <li key={e.id} style={{ border: '1px solid #000', padding: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 12 }}>
                      &lt;{displayName(e.author_email)}&gt;
                    </div>
                    {e.title ? <div style={{ marginTop: 4 }}>{e.title}</div> : null}
                    <div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{e.content}</div>
                    <div style={{ fontSize: 10, opacity: 0.6, marginTop: 6 }}>
                      {new Date(e.created_at).toLocaleString('ko-KR')}
                    </div>
                  </div>

                  {isMine && (
                    <Button variant="ghost" onClick={() => handleDeleteEntry(e.id)}>
                      삭제
                    </Button>
                  )}
                </div>

                {/* 댓글 */}
                <div style={{ marginTop: 10, borderTop: '1px dashed #000', paddingTop: 8 }}>
                  <div style={{ fontSize: 11, marginBottom: 6 }}>댓글</div>

                  <ul style={{ display: 'grid', gap: 6, marginBottom: 8 }}>
                    {comments.map((c) => {
                      const isMyComment = me?.id && c.user_id === me.id;
                      return (
                        <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <div>
                            <span style={{ opacity: 0.8 }}>
                              &lt;{displayName(c.author_email)}&gt;
                            </span>{' '}
                            {c.content}
                          </div>

                          {isMyComment && (
                            <Button variant="ghost" onClick={() => handleDeleteComment(c.id, e.id)}>
                              삭제
                            </Button>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      placeholder="댓글 달기…"
                      value={commentDraft[e.id] ?? ''}
                      onChange={(ev) =>
                        setCommentDraft((prev) => ({ ...prev, [e.id]: ev.target.value }))
                      }
                      style={{ flex: 1 }}
                      maxLength={200}
                    />
                    <Button type="button" variant="primary" onClick={() => handleAddComment(e.id)}>
                      등록
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
