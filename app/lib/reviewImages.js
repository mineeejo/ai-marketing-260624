import { REVIEW_BUCKET } from "./supabase";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB (클라이언트에서 압축 후 업로드)
export const MAX_IMAGES = 10; // 후기 1건당 최대 첨부 장수
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// 여러 이미지 파일을 업로드하고 public URL 배열을 돌려줍니다.
export async function uploadReviewImages(supabase, images) {
  const files = (images || []).filter(
    (f) => f && typeof f.arrayBuffer === "function" && f.size > 0
  );
  if (files.length > MAX_IMAGES) {
    throw new ValidationError(`사진은 최대 ${MAX_IMAGES}장까지 첨부할 수 있습니다.`);
  }
  const urls = [];
  for (const f of files) urls.push(await uploadReviewImage(supabase, f));
  return urls;
}

// FormData의 이미지 파일을 검증하고 Storage에 업로드한 뒤 public URL을 돌려줍니다.
// 이미지가 없으면 null을 반환합니다. 유효성 오류는 throw 합니다.
export async function uploadReviewImage(supabase, image) {
  if (!image || typeof image.arrayBuffer !== "function" || image.size === 0) {
    return null;
  }
  if (!ALLOWED_TYPES.includes(image.type)) {
    throw new ValidationError("이미지는 JPG, PNG, WEBP, GIF 형식만 가능합니다.");
  }
  if (image.size > MAX_IMAGE_BYTES) {
    throw new ValidationError("이미지 용량은 10MB 이하만 가능합니다.");
  }

  const ext = (image.name?.split(".").pop() || "jpg").toLowerCase();
  const key = `${Date.now()}-${Math.round(performance.now())}.${ext}`;
  const buffer = Buffer.from(await image.arrayBuffer());

  const { error } = await supabase.storage
    .from(REVIEW_BUCKET)
    .upload(key, buffer, { contentType: image.type, upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from(REVIEW_BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

// public URL에서 Storage 내부 경로(key)를 추출합니다. (수정/삭제 시 이전 사진 제거용)
export function storageKeyFromUrl(url) {
  if (!url) return null;
  const marker = `/${REVIEW_BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

export async function deleteReviewImage(supabase, url) {
  const key = storageKeyFromUrl(url);
  if (!key) return;
  await supabase.storage.from(REVIEW_BUCKET).remove([key]);
}

// 400 응답으로 매핑할 검증 오류
export class ValidationError extends Error {}
