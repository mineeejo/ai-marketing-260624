"use client";

import { useState, useEffect } from "react";
import { compressImage } from "../../lib/compressImage";

export const MAX_IMAGES = 10;

export const RATING_OPTIONS = [
  { v: "5", label: "★★★★★ 매우 만족" },
  { v: "4", label: "★★★★☆ 만족" },
  { v: "3", label: "★★★☆☆ 보통" },
  { v: "2", label: "★★☆☆☆ 아쉬움" },
  { v: "1", label: "★☆☆☆☆ 불만족" },
];

export function Stars({ n }) {
  return <div className="stars">{"★".repeat(n) + "☆".repeat(5 - n)}</div>;
}

export function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

// 사진 크게 보기 (라이트박스): ‹ › 로 넘기기, ✕/바깥클릭/ESC 로 닫기
export function PhotoLightbox({ photos, index, onIndex, onClose }) {
  const n = photos.length;
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onIndex((index - 1 + n) % n);
      else if (e.key === "ArrowRight") onIndex((index + 1) % n);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, n, onIndex, onClose]);

  return (
    <div className="lightbox" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <button className="lb-close" onClick={onClose} aria-label="닫기">✕</button>
      {n > 1 && (
        <button className="lb-nav lb-prev" onClick={() => onIndex((index - 1 + n) % n)} aria-label="이전 사진">‹</button>
      )}
      <img className="lb-img" src={photos[index]} alt={`후기 사진 ${index + 1}`} />
      {n > 1 && (
        <button className="lb-nav lb-next" onClick={() => onIndex((index + 1) % n)} aria-label="다음 사진">›</button>
      )}
      {n > 1 && <div className="lb-count">{index + 1} / {n}</div>}
    </div>
  );
}

export function Gallery({ urls }) {
  const [open, setOpen] = useState(-1); // 열린 사진 index (-1이면 닫힘)
  if (!urls || urls.length === 0) return null;
  return (
    <>
      <div className="photo-grid">
        {urls.map((u, i) => (
          <img
            key={i}
            className="photo-thumb"
            src={u}
            alt="후기 사진"
            loading="lazy"
            style={{ cursor: "zoom-in" }}
            onClick={() => setOpen(i)}
          />
        ))}
      </div>
      {open >= 0 && (
        <PhotoLightbox photos={urls} index={open} onIndex={setOpen} onClose={() => setOpen(-1)} />
      )}
    </>
  );
}

// 폼의 image 필드(여러 장)를 각각 압축본으로 교체합니다. 최대 MAX_IMAGES 장.
export async function withCompressedImages(formData) {
  const files = formData
    .getAll("image")
    .filter((f) => f && typeof f.size === "number" && f.size > 0);
  formData.delete("image");
  for (const f of files.slice(0, MAX_IMAGES)) {
    formData.append("image", await compressImage(f));
  }
  return { formData, count: files.length };
}
