// 페이지별 공유(OG) 메타데이터 헬퍼.
// 어떤 URL을 카톡·SNS에 공유해도 캐년 사진 + 그 페이지 제목이 뜨도록 합니다.

export const SITE_URL = "https://joygamsungtour.vercel.app";
export const OG_IMAGE =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3CkUAX5vl7hsRPpzsmLNJVSyYqp/hf_20260626_053223_23dff708-92fa-4a83-a907-239321237c24.png";

export function pageMeta({ title, description, path = "", image = OG_IMAGE }) {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: SITE_URL + path,
      siteName: "조이감성투어",
      locale: "ko_KR",
      images: [{ url: image, width: 1024, height: 1024, alt: "그랜드캐년 조이감성투어" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
