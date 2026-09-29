"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MAX_IMAGES } from "./shared";
import { compressImage } from "../../lib/compressImage";

export const MAX_CONTENT = 500; // 후기 내용 최대 글자수

// 사진을 한 장씩 업로드해 URL 배열을 받아옵니다. (Vercel 요청 용량 한계 회피)
export async function uploadImages(files) {
  const urls = [];
  for (const f of files) {
    if (!f || !f.size) continue;
    const compressed = await compressImage(f);
    const fd = new FormData();
    fd.append("image", compressed);
    const res = await fetch("/api/reviews/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({ error: "사진 업로드에 실패했습니다." }));
    if (!res.ok) throw new Error(data.error || "사진 업로드에 실패했습니다.");
    urls.push(data.url);
  }
  return urls;
}

export default function ReviewForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [previews, setPreviews] = useState([]); // [{ file, url }]
  const [contentLen, setContentLen] = useState(0);

  function addFiles(e) {
    const picked = Array.from(e.target.files || []);
    setPreviews((prev) => {
      const room = MAX_IMAGES - prev.length;
      const next = picked.slice(0, Math.max(0, room)).map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      return [...prev, ...next];
    });
    e.target.value = ""; // 같은 파일 다시 선택 가능하도록 초기화
  }

  function removeAt(i) {
    setPreviews((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(i, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return copy;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const name = String(fd.get("name") || "").trim();
      const password = String(fd.get("password") || "");
      const content = String(fd.get("content") || "").trim();

      const imageUrls = await uploadImages(previews.map((p) => p.file));

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password, content, imageUrls }),
      });
      const data = await res.json().catch(() => ({ error: "후기 등록에 실패했습니다." }));
      if (!res.ok) throw new Error(data.error);
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      router.push("/reviews");
      router.refresh();
    } catch (err) {
      setMsg({ type: "error", text: err.message || "후기 등록에 실패했습니다." });
      setSubmitting(false);
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      {msg && <p className={`form-msg ${msg.type}`}>{msg.text}</p>}

      <div className="field-row">
        <div className="field">
          <label htmlFor="name">이름 / 닉네임</label>
          <input id="name" name="name" maxLength={30} required placeholder="홍길동" />
        </div>
        <div className="field">
          <label htmlFor="password">비밀번호 (숫자 4자리)</label>
          <input
            id="password"
            name="password"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            required
            placeholder="수정·삭제 시 필요"
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="content">후기 내용</label>
        <textarea
          id="content"
          name="content"
          maxLength={MAX_CONTENT}
          required
          placeholder="여행은 어떠셨나요? 솔직한 후기를 남겨주세요."
          onChange={(e) => setContentLen(e.target.value.length)}
        />
        <div className="char-count">
          {contentLen} / {MAX_CONTENT}자
        </div>
      </div>

      <div className="field">
        <label>사진 첨부 (선택 · 최대 {MAX_IMAGES}장)</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          multiple
          onChange={addFiles}
          disabled={previews.length >= MAX_IMAGES}
          hidden
        />
        <div className="preview-grid">
          {previews.map((p, i) => (
            <div key={p.url} className="preview-item">
              <img src={p.url} alt={`선택한 사진 ${i + 1}`} />
              <button
                type="button"
                className="preview-remove"
                onClick={() => removeAt(i)}
                aria-label="사진 제거"
              >
                ✕
              </button>
            </div>
          ))}
          {previews.length < MAX_IMAGES && (
            <label htmlFor="image" className="photo-add-tile">
              <span className="pa-plus">＋</span>
              <span className="pa-text">사진 추가</span>
            </label>
          )}
        </div>
        {previews.length > 0 && (
          <p className="section-sub" style={{ fontSize: 13, marginTop: 8 }}>
            {previews.length} / {MAX_IMAGES}장 선택됨
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? "등록 중..." : "후기 등록"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => history.back()}
          disabled={submitting}
        >
          취소
        </button>
      </div>
    </form>
  );
}
