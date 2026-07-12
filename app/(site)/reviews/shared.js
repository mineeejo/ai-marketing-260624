"use client";

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

export function Gallery({ urls }) {
  if (!urls || urls.length === 0) return null;
  return (
    <div className="photo-grid">
      {urls.map((u, i) => (
        <img key={i} className="photo-thumb" src={u} alt="후기 사진" loading="lazy" />
      ))}
    </div>
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
