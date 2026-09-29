"use client";

import { useEffect, useState } from "react";
import { MAX_IMAGES, Gallery, formatDate } from "./shared";
import { uploadImages, MAX_CONTENT } from "./ReviewForm";

export default function ReviewsList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReviews(data.reviews);
    } catch (e) {
      setErr("후기를 불러오지 못했습니다: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // 다른 페이지(메인 등)에서 넘어올 때 항상 맨 위에서 시작
    try {
      window.scrollTo(0, 0);
    } catch {}
    load();
    // 관리자 로그인 여부 확인 (로그인 시 비번 없이 관리 + 답글 가능)
    fetch("/api/admin/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setIsAdmin(Boolean(d.loggedIn)))
      .catch(() => setIsAdmin(false));
  }, []);

  function handleUpdated(updated) {
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }
  function handleDeleted(id) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return <p className="empty">후기를 불러오는 중...</p>;
  if (err) return <p className="empty">{err}</p>;
  if (reviews.length === 0)
    return <p className="empty">아직 후기가 없어요. 첫 번째 후기를 남겨주세요! ✍️</p>;

  return (
    <div className="review-list">
      {isAdmin && (
        <p className="admin-flag">🧑‍💼 관리자 모드 · 모든 후기를 비밀번호 없이 관리하고 답글을 달 수 있어요.</p>
      )}
      {reviews.map((r) => (
        <ReviewItem
          key={r.id}
          review={r}
          isAdmin={isAdmin}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      ))}
    </div>
  );
}

function ReviewItem({ review, isAdmin, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [replying, setReplying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [keptUrls, setKeptUrls] = useState([]); // 유지할 기존 사진
  const [editPreviews, setEditPreviews] = useState([]); // 새로 추가한 사진 [{file,url}]
  const [editPassword, setEditPassword] = useState(""); // 진입 시 확인된 비밀번호
  const [editContentLen, setEditContentLen] = useState(0);

  async function openEdit() {
    let pw = "";
    if (!isAdmin) {
      // 수정 화면에 들어가기 전에 비밀번호부터 확인 — 틀리면 진입 자체를 막음
      pw = window.prompt("후기를 수정하려면 비밀번호(4자리)를 입력하세요.") ?? "";
      if (pw === "") return; // 취소하거나 빈값
      try {
        const res = await fetch(`/api/reviews/${review.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: pw }),
        });
        const data = await res.json().catch(() => ({ error: "확인에 실패했습니다." }));
        if (!res.ok) {
          window.alert(data.error || "비밀번호가 일치하지 않습니다.");
          return; // 틀리면 수정 화면 안 열림
        }
      } catch {
        window.alert("확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }
    }
    setEditPassword(pw);
    setKeptUrls(Array.isArray(review.image_urls) ? review.image_urls : []);
    setEditPreviews([]);
    setEditContentLen((review.content || "").length);
    setErr(null);
    setEditing(true);
  }
  function closeEdit() {
    editPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    setEditPreviews([]);
    setEditPassword("");
    setEditing(false);
  }
  function addEditFiles(e) {
    const picked = Array.from(e.target.files || []);
    setEditPreviews((prev) => {
      const room = MAX_IMAGES - keptUrls.length - prev.length;
      const next = picked.slice(0, Math.max(0, room)).map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      return [...prev, ...next];
    });
    e.target.value = "";
  }
  function removeKept(i) {
    setKeptUrls((prev) => prev.filter((_, idx) => idx !== i));
  }
  function removeEditPreview(i) {
    setEditPreviews((prev) => {
      const copy = [...prev];
      const [rm] = copy.splice(i, 1);
      if (rm) URL.revokeObjectURL(rm.url);
      return copy;
    });
  }

  async function handleEdit(e) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const fd = new FormData(e.currentTarget);
      const content = String(fd.get("content") || "");
      const newUrls = await uploadImages(editPreviews.map((p) => p.file));
      const imageUrls = [...keptUrls, ...newUrls];

      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: editPassword, content, imageUrls }),
      });
      const data = await res.json().catch(() => ({ error: "수정에 실패했습니다." }));
      if (!res.ok) throw new Error(data.error);
      editPreviews.forEach((p) => URL.revokeObjectURL(p.url));
      onUpdated(data.review);
      setEditing(false);
    } catch (e2) {
      setErr(e2.message || "수정에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    let url = `/api/reviews/${review.id}`;
    if (isAdmin) {
      if (!window.confirm("이 후기를 삭제할까요? (관리자 권한)")) return;
    } else {
      const pw = window.prompt("후기를 삭제하려면 비밀번호(4자리)를 입력하세요.");
      if (pw == null) return;
      url += `?password=${encodeURIComponent(pw)}`;
    }
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onDeleted(review.id);
    } catch (e2) {
      setErr(e2.message || "삭제에 실패했습니다.");
      setBusy(false);
    }
  }

  // 관리자 답글 저장/삭제
  async function submitReply(e) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const fd = new FormData(e.currentTarget);
      const adminReply = String(fd.get("adminReply") || "");
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply }),
      });
      const data = await res.json().catch(() => ({ error: "답글 저장에 실패했습니다." }));
      if (!res.ok) throw new Error(data.error);
      onUpdated(data.review);
      setReplying(false);
    } catch (e2) {
      setErr(e2.message || "답글 저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteReply() {
    if (!window.confirm("사장님 답글을 삭제할까요?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: "" }),
      });
      const data = await res.json().catch(() => ({ error: "답글 삭제에 실패했습니다." }));
      if (!res.ok) throw new Error(data.error);
      onUpdated(data.review);
    } catch (e2) {
      setErr(e2.message || "답글 삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <form className="review-item" onSubmit={handleEdit}>
        {err && <p className="form-msg error">{err}</p>}
        <div className="field">
          <label>후기 내용</label>
          <textarea
            name="content"
            maxLength={MAX_CONTENT}
            required
            defaultValue={review.content}
            onChange={(e) => setEditContentLen(e.target.value.length)}
          />
          <div className="char-count">
            {editContentLen} / {MAX_CONTENT}자
          </div>
        </div>
        <div className="field">
          <label>사진 (최대 {MAX_IMAGES}장)</label>
          <input
            id={`edit-image-${review.id}`}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={addEditFiles}
            disabled={keptUrls.length + editPreviews.length >= MAX_IMAGES}
          />
          <div className="preview-grid">
            {keptUrls.map((u, i) => (
              <div key={u} className="preview-item">
                <img src={u} alt={`사진 ${i + 1}`} />
                <button type="button" className="preview-remove" onClick={() => removeKept(i)} aria-label="사진 제거">✕</button>
              </div>
            ))}
            {editPreviews.map((p, i) => (
              <div key={p.url} className="preview-item">
                <img src={p.url} alt={`새 사진 ${i + 1}`} />
                <button type="button" className="preview-remove" onClick={() => removeEditPreview(i)} aria-label="사진 제거">✕</button>
              </div>
            ))}
            {keptUrls.length + editPreviews.length < MAX_IMAGES && (
              <label htmlFor={`edit-image-${review.id}`} className="photo-add-tile">
                <span className="pa-plus">＋</span>
                <span className="pa-text">사진 추가</span>
              </label>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "저장 중..." : "저장"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={closeEdit}
            disabled={busy}
          >
            취소
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="review-item">
      <div className="rv-head">
        <div className="rv-row">
          <span className="rv-label">작성자</span>
          <span className="who">{review.name}</span>
        </div>
        <div className="rv-row">
          <span className="rv-label">작성일</span>
          <span className="when">
            {formatDate(review.created_at)}
            {review.updated_at && review.updated_at !== review.created_at ? " (수정됨)" : ""}
          </span>
        </div>
      </div>
      <p className="content">{review.content}</p>
      <Gallery urls={review.image_urls} />

      {/* 사장님(관리자) 답글 */}
      {review.admin_reply && !replying && (
        <div className="admin-reply">
          <div className="ar-head">🧑‍💼 사장님 답글</div>
          <p className="ar-body">{review.admin_reply}</p>
          {isAdmin && (
            <div className="ar-actions">
              <button type="button" className="link-btn" onClick={() => setReplying(true)}>
                답글 수정
              </button>
              <button type="button" className="link-btn danger" onClick={deleteReply} disabled={busy}>
                답글 삭제
              </button>
            </div>
          )}
        </div>
      )}

      {/* 관리자 답글 작성/수정 폼 */}
      {isAdmin && replying && (
        <form className="admin-reply-form" onSubmit={submitReply}>
          <label>사장님 답글</label>
          <textarea
            name="adminReply"
            maxLength={1000}
            required
            defaultValue={review.admin_reply || ""}
            placeholder="고객님께 남길 답글을 작성해주세요."
          />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn" type="submit" disabled={busy}>
              {busy ? "저장 중..." : "답글 등록"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setReplying(false)} disabled={busy}>
              취소
            </button>
          </div>
        </form>
      )}

      {err && <p className="form-msg error" style={{ marginTop: 10 }}>{err}</p>}

      <div className="review-actions">
        {isAdmin && !review.admin_reply && !replying && (
          <button type="button" className="link-btn accent" onClick={() => setReplying(true)}>
            💬 답글 달기
          </button>
        )}
        <button type="button" className="link-btn" onClick={openEdit}>
          수정
        </button>
        <button type="button" className="link-btn danger" onClick={handleDelete} disabled={busy}>
          삭제
        </button>
      </div>
    </div>
  );
}
