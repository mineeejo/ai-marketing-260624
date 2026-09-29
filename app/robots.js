import { SITE_URL } from "./lib/seo";

// 검색엔진 크롤러 안내 (구글·네이버 등). 모든 페이지 수집 허용 + 사이트맵 위치 안내.
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
