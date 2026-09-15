"use client";

import { useEffect, useState } from "react";
import { MAX_IMAGES, Gallery, formatDate, withCompressedImages } from "./shared";

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

  async function handleEdit(e) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const { formData: fd, count } = await withCompressedImages(
        new FormData(e.currentTarget)
      );
      if (count > MAX_IMAGES) {
        throw new Error(`사진은 최대 ${MAX_IMAGES}장까지 첨부할 수 있습니다.`);
      }
      const res = await fetch(`/api/reviews/${review.id}`, { method: "PATCH", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
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
      const pw = window.prompt(
        "삭제하려면 비밀번호를 입력하세요.\n(작성 시 등록한 4자리 · 관리자는 관리자 비밀번호)"
      );
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
      const fd = new FormData(e.currentTarget); // adminReply 필드 포함
      const res = await fetch(`/api/reviews/${review.id}`, { method: "PATCH", body: fd });
      const data = await res.json();
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
      const fd = new FormData();
      fd.append("adminReply", "");
      const res = await fetch(`/api/reviews/${review.id}`, { method: "PATCH", body: fd });
      const data = await res.json();
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
        {!isAdmin && (
          <div className="field">
            <label>비밀번호 (작성 시 입력한 4자리 · 관리자는 관리자 비밀번호)</label>
            <input name="password" maxLength={32} required placeholder="****" />
          </div>
        )}
        <div className="field">
          <label>후기 내용</label>
          <textarea name="content" maxLength={2000} required defaultValue={review.content} />
        </div>
        {review.image_urls?.length > 0 && (
          <div className="field">
            <Gallery urls={review.image_urls} />
            <label style={{ fontWeight: 400, marginTop: 6 }}>
              <input type="checkbox" name="removeImages" value="true" /> 기존 사진 모두 삭제
            </label>
          </div>
        )}
        <div className="field">
          <label>사진 추가 (선택 · 최대 10장, 기존 사진에 이어붙임)</label>
          <input name="image" type="file" accept="image/*" multiple />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "저장 중..." : "저장"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setEditing(false)}
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
      <div className="top">
        <span className="who">{review.name}</span>
        <span className="when">
          {formatDate(review.created_at)}
          {review.updated_at && review.updated_at !== review.created_at ? " (수정됨)" : ""}
        </span>
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
        <button type="button" className="link-btn" onClick={() => setEditing(true)}>
          수정
        </button>
        <button type="button" className="link-btn danger" onClick={handleDelete} disabled={busy}>
          삭제
        </button>
      </div>
    </div>
  );
}
