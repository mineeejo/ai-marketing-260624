// 최근 뉴스 (Yahoo Finance 공개 search 엔드포인트의 news, 키 없음).
// 종목이 "왜 움직였는지"의 근거를 '실제 기사 헤드라인'으로 제공한다(앱이 지어내지 않음).
// 참고: .KS/.KQ(한국) 종목은 이 무료 소스가 관련도 낮은 뉴스를 주므로 호출하지 않는다.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const YF_HOSTS = [
  "https://query1.finance.yahoo.com",
  "https://query2.finance.yahoo.com",
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "").trim();
  if (!symbol || !/^[A-Za-z0-9.\-=^]{1,15}$/.test(symbol)) {
    return Response.json({ ok: false, error: "유효하지 않은 종목", news: [] }, { status: 400 });
  }
  // 한국 종목은 무료 소스의 뉴스 관련도가 낮아 제공하지 않음(가짜 근거 방지)
  if (/\.K[SQ]$/.test(symbol)) {
    return Response.json({ ok: true, supported: false, news: [] });
  }

  const path = `/v1/finance/search?q=${encodeURIComponent(symbol)}&quotesCount=0&newsCount=8&enableFuzzyQuery=false`;
  let lastErr = null;
  for (const host of YF_HOSTS) {
    try {
      const res = await fetch(host + path, {
        headers: { "User-Agent": "Mozilla/5.0" },
        cache: "no-store",
      });
      if (!res.ok) { lastErr = `HTTP ${res.status}`; continue; }
      const json = await res.json();
      const items = Array.isArray(json?.news) ? json.news : [];
      const news = items
        .filter((n) => n.title && n.link)
        .slice(0, 6)
        .map((n) => ({
          title: n.title,
          publisher: n.publisher || "",
          link: n.link,
          time: typeof n.providerPublishTime === "number" ? n.providerPublishTime * 1000 : null,
        }));
      return Response.json(
        { ok: true, supported: true, news },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (e) {
      lastErr = e?.message || String(e);
    }
  }
  return Response.json({ ok: false, supported: true, error: lastErr || "unknown", news: [] }, { status: 502 });
}
