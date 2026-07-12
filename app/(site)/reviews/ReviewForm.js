"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RATING_OPTIONS, MAX_IMAGES, withCompressedImages } from "./shared";

export default function ReviewForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setSubmitting(true);
    try {
      const { formData: fd, count } = await withCompressedImages(
        new FormData(e.currentTarget)
      );
      if (count > MAX_IMAGES) {
        throw new Error(`사진은 최대 ${MAX_IMAGES}장까지 첨부할 수 있습니다.`);
      }
      const res = await fetch("/api/reviews", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
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
        <label htmlFor="rating">평점</label>
        <select id="rating" name="rating" defaultValue="5">
          {RATING_OPTIONS.map((o) => (
            <option key={o.v} value={o.v}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="content">후기 내용</label>
        <textarea
          id="content"
          name="content"
          maxLength={2000}
          required
          placeholder="여행은 어떠셨나요? 솔직한 후기를 남겨주세요."
        />
      </div>

      <div className="field">
        <label htmlFor="image">사진 첨부 (선택 · 최대 10장 · 업로드 시 자동 압축)</label>
        <input id="image" name="image" type="file" accept="image/*" multiple />
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
