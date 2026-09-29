import { SITE_URL } from "./lib/seo";
import { getTours } from "./lib/toursDb";

export const dynamic = "force-dynamic";

// 검색엔진에 제출할 페이지 목록. 새 상품이 생기면 자동으로 포함됩니다.
export default async function sitemap() {
  const now = new Date();
  const staticRoutes = ["", "/tours", "/reviews", "/why", "/book"].map((p) => ({
    url: SITE_URL + p,
    lastModified: now,
    changeFrequency: p === "/reviews" ? "daily" : "weekly",
    priority: p === "" ? 1 : 0.8,
  }));

  let tourRoutes = [];
  try {
    const tours = await getTours();
    tourRoutes = tours
      .filter((t) => !t.comingSoon)
      .map((t) => ({
        url: `${SITE_URL}/tours/${t.id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      }));
  } catch {
    // 무시
  }

  return [...staticRoutes, ...tourRoutes];
}
