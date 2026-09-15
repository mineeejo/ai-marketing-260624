"use client";

import { useEffect, useState } from "react";
import {
  RATING_OPTIONS,
  MAX_IMAGES,
  Stars,
  Gallery,
  formatDate,
  withCompressedImages,
} from "./shared";

export default function ReviewsList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

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
      {reviews.map((r) => (
        <ReviewItem
          key={r.id}
          review={r}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      ))}
    </div>
  );
}

function ReviewItem({ review, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
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
    const pw = window.prompt(
      "삭제하려면 비밀번호를 입력하세요.\n(작성 시 등록한 4자리 · 관리자는 관리자 비밀번호)"
    );
    if (pw == null) return;
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(
        `/api/reviews/${review.id}?password=${encodeURIComponent(pw)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onDeleted(review.id);
    } catch (e2) {
      setErr(e2.message || "삭제에 실패했습니다.");
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <form className="review-item" onSubmit={handleEdit}>
        {err && <p className="form-msg error">{err}</p>}
        <div className="field">
          <label>비밀번호 (작성 시 입력한 4자리 · 관리자는 관리자 비밀번호)</label>
          <input
            name="password"
            maxLength={32}
            required
            placeholder="****"
          />
        </div>
        <div className="field">
          <label>평점</label>
          <select name="rating" defaultValue={String(review.rating)}>
            {RATING_OPTIONS.map((o) => (
              <option key={o.v} value={o.v}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
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
      <Stars n={review.rating} />
      <p className="content">{review.content}</p>
      <Gallery urls={review.image_urls} />
      {err && <p className="form-msg error" style={{ marginTop: 10 }}>{err}</p>}
      <div className="review-actions">
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
