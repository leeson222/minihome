import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // 경로는 네 프로젝트에 맞게 수정

import Button from '../components/ui/Button';

function getAuthorName(email) {
  if (!email) return "Unknown";

  if (email.startsWith("chatora")) {
    return "유우시";
  }
  if (email.startsWith("kuroneko")) {
    return "리쿠";
  }

  return email; // 다른 이메일은 그냥 이메일 노출
}

export default function Video() {
  const [user, setUser] = useState(null);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [imageFile, setImageFile] = useState(null); // 리사이즈된 blob
  const [previewUrl, setPreviewUrl] = useState("");
  const [caption, setCaption] = useState("");

  const [uploading, setUploading] = useState(false);
  const [commentInputs, setCommentInputs] = useState({}); // { [postId]: "댓글 내용" }

  // ===== 유저 정보 가져오기 =====
  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("auth getUser error:", error);
        return;
      }
      setUser(data.user);
    }

    loadUser();
  }, []);

  // ===== 게시글 목록 불러오기 =====
  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("photo_posts")
      .select(
        `
        id,
        user_id,
        author_email,
        image_url,
        caption,
        created_at,
        photo_comments (
          id,
          user_id,
          author_email,
          content,
          created_at
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchPosts error:", error);
      setLoading(false);
      return;
    }

    // 댓글은 created_at 오름차순 정렬
    const normalized = (data || []).map((post) => ({
      ...post,
      photo_comments: (post.photo_comments || []).sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      ),
    }));

    setPosts(normalized);
    setLoading(false);
  }

  // ===== 이미지 업로드 + 가로 최대 250px 리사이즈 =====
  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);

    img.onload = () => {
      const MAX_WIDTH = 250;

      let targetWidth = img.width;
      let targetHeight = img.height;

      if (img.width > MAX_WIDTH) {
        const scale = MAX_WIDTH / img.width;
        targetWidth = MAX_WIDTH;
        targetHeight = img.height * scale;
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const resizedUrl = URL.createObjectURL(blob);

          setImageFile(blob); // 리사이즈된 blob
          setPreviewUrl(resizedUrl); // 프리뷰용 URL
        },
        "image/jpeg",
        0.9
      );
    };
  }

  // ===== 게시글 업로드 (Storage + DB) =====
  async function handleSubmit(e) {
    e.preventDefault();

    if (!user) {
      alert("로그인한 사용자만 사진을 올릴 수 있어.");
      return;
    }

    if (!imageFile) {
      alert("사진을 먼저 선택해줘!");
      return;
    }

    setUploading(true);

    try {
      // Storage에 업로드
      const fileName = `photo-${user.id}-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("photos") // 🔴 버킷 이름 실제 걸로 맞춰줘
        .upload(fileName, imageFile, {
          contentType: "image/jpeg",
        });

      if (uploadError) {
        console.error("upload error:", uploadError);
        alert("이미지 업로드 중 오류가 발생했어.");
        setUploading(false);
        return;
      }

      // public URL 가져오기
      const {
        data: { publicUrl },
      } = supabase.storage.from("photos").getPublicUrl(fileName);

      // DB에 포스트 생성
      const { error: insertError } = await supabase.from("photo_posts").insert({
        // user_id는 default auth.uid()로 들어감
        author_email: user.email,
        image_url: publicUrl,
        caption: caption.trim(),
      });

      if (insertError) {
        console.error("insert post error:", insertError);
        alert("게시글 저장 중 오류가 발생했어.");
        setUploading(false);
        return;
      }

      // 성공 시 폼 초기화 + 목록 다시 불러오기
      setImageFile(null);
      setPreviewUrl("");
      setCaption("");
      await fetchPosts();
    } finally {
      setUploading(false);
    }
  }

  // ===== 게시글 삭제 =====
  async function handleDeletePost(postId) {
    if (!user) {
      alert("로그인한 사용자만 삭제할 수 있어.");
      return;
    }

    if (!window.confirm("이 사진을 삭제할까?")) return;

    const { error } = await supabase
      .from("photo_posts")
      .delete()
      .eq("id", postId);

    if (error) {
      console.error("delete post error:", error);
      alert("삭제 중 오류가 발생했어.");
      return;
    }

    // 로컬 상태 업데이트 or 다시 fetch
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  // ===== 댓글 입력 상태 변경 =====
  function handleCommentInputChange(postId, value) {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  }

  // ===== 댓글 등록 =====
  async function handleAddComment(postId) {
    if (!user) {
      alert("로그인한 사용자만 댓글을 달 수 있어.");
      return;
    }

    const content = (commentInputs[postId] || "").trim();
    if (!content) return;

    const { error } = await supabase.from("photo_comments").insert({
      post_id: postId,
      author_email: user.email,
      content,
      // user_id는 default auth.uid()
    });

    if (error) {
      console.error("insert comment error:", error);
      alert("댓글 저장 중 오류가 발생했어.");
      return;
    }

    // 입력창 비우기
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: "",
    }));

    // 댓글만 다시 불러오고 싶으면 분리 쿼리 써도 되지만,
    // 간단하게 전체 포스트를 새로 갱신
    await fetchPosts();
  }

   // ===== 댓글 삭제 =====
   async function handleDeleteComment(postId, commentId) {
    if (!user) {
      alert("로그인한 사용자만 삭제할 수 있어.");
      return;
    }

    if (!window.confirm("이 댓글을 삭제할까?")) return;

    const { error } = await supabase
      .from("photo_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error("delete comment error:", error);
      alert("댓글 삭제 중 오류가 발생했어.");
      return;
    }

    // 로컬 상태에서 해당 댓글 제거
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              photo_comments: post.photo_comments.filter(
                (c) => c.id !== commentId
              ),
            }
          : post
      )
    );
  }

  // ===== 유저 표시용 이름 (email -> 앞부분) =====
  function displayName(email) {
    if (!email) return "손님";
  
    const lower = email.toLowerCase();
  
    // 특정 이메일 → 이름 매핑
    if (lower.startsWith("chatora")) {
      return "유우시";
    }
    if (lower.startsWith("kuroneko")) {
      return "리쿠";
    }
  
    // 그 외는 그냥 아이디 부분만
    return lower.split("@")[0];
  }

  // ===== 렌더링 =====
  if (!user) {
    return (
      <div className="photo-page">
        <h2 className="photo-title">사진첩</h2>
        <p className="photo-empty">
          사진첩을 사용하려면 먼저 로그인해 줘.
        </p>
      </div>
    );
  }

  return (
    <div className="content-block">
      <h2 className="content-title">프로필</h2>

      {/* 업로드 폼 */}
      <form className="photo-form" onSubmit={handleSubmit}>
        <div className="photo-form-row">
          <div className="photo-label">
            글쓴이
            <div className="photo-author-display">
              {displayName(user.email)} ({user.email})
            </div>
          </div>
        </div>

        <div className="photo-form-row">
          <label className="photo-label">
            사진 선택
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </label>
        </div>

        {previewUrl && (
          <div className="photo-preview">
            <img src={previewUrl} alt="preview" />
          </div>
        )}

        <div className="photo-form-row">
          <textarea
            className="photo-textarea"
            placeholder="리쿠랑 유우시의 추억 업로드하기"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="photo-submit-btn"
          disabled={uploading}
        >
          {uploading ? "올리는 중..." : "사진 올리기"}
        </button>
      </form>

      {/* 사진 리스트 */}
      <div className="photo-list">
        {loading ? (
          <p className="photo-empty">사진 불러오는 중...</p>
        ) : posts.length === 0 ? (
          <p className="photo-empty">
            아직 올린 사진이 없어. 첫 사진의 주인공이 되어줘 📸
          </p>
        ) : (
          posts.map((post) => (
            <div className="photo-item" key={post.id}>
              <div className="photo-meta-top">
                  <span className="photo-author">
                    📷 {displayName(post.author_email)}
                  </span>
                  <span className="photo-date">
                    {new Date(post.created_at).toLocaleString()}
                  </span>
                </div>
              <div className="photo-image-wrap">
                <img src={post.image_url} alt={post.caption || "photos"} />
              </div>

              <div className="photo-meta">
                <p className="photo-text">{post.caption || "..."}</p>

                {/* 자기 글이면 삭제 버튼 노출 */}
                {post.user_id === user.id && (
                  <Button
                    variant="guest-del2"
                    onClick={() => handleDeletePost(post.id)}>
                    삭제
                  </Button>
                )}
              </div>

              {/* 댓글 영역 */}
              <div className="photo-comments">
                <div className="photo-comments-header">댓글</div>

                {!post.photo_comments || post.photo_comments.length === 0 ? (
                  <p className="photo-comments-empty">
                    아직 댓글이 없어. 첫 댓글을 남겨줘 💬
                  </p>
                ) : (
                  <ul className="photo-comments-list">
                    {post.photo_comments.map((comment) => (
                      <li key={comment.id} className="photo-comment-item">
                        <div className="photo-comment-top">
                          <span className="photo-comment-author">
                            {displayName(comment.author_email)}
                          </span>
                          <span className="photo-comment-date">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                          <Button
                            variant="guest-del2"
                            onClick={() => handleDeleteComment(post.id, comment.id)}>
                            삭제
                          </Button>
                        </div>
                        <p className="photo-comment-text">
                          {comment.content}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="photo-comment-form">
                  <input
                    type="text"
                    className="photo-comment-input"
                    placeholder="댓글을 남겨봐 :)"
                    value={commentInputs[post.id] || ""}
                    onChange={(e) =>
                      handleCommentInputChange(post.id, e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddComment(post.id);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="photo-comment-submit-btn"
                    onClick={() => handleAddComment(post.id)}
                  >
                    등록
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
