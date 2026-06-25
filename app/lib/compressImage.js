// 브라우저에서 업로드 전에 이미지를 줄여 용량을 낮춥니다.
// 가로 최대 1600px, JPEG 품질 0.8로 다시 인코딩. GIF(애니메이션)는 그대로 둡니다.
const MAX_WIDTH = 1600;
const QUALITY = 0.8;

export async function compressImage(file) {
  if (!file || !file.type.startsWith("image/")) return file;
  if (file.type === "image/gif") return file; // 애니메이션 보존

  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);

  const scale = Math.min(1, MAX_WIDTH / img.width);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(img, 0, 0, w, h);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY)
  );
  if (!blob) return file; // 변환 실패 시 원본 사용

  // 압축본이 더 크면(작은 이미지 등) 원본 유지
  if (blob.size >= file.size) return file;

  const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
