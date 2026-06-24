// 오늘 미국에서 거래량이 많은 종목 (Yahoo 공개 screener, 키 없음).
// '추천'이 아니라 '사실(거래량 상위)' 제공용. 대형주 위주라 초보 참고에 적합.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const YF_HOSTS = [
  "https://query1.finance.yahoo.com",
  "https://query2.finance.yahoo.com",
];

export async function GET() {
  const path =
    "/v1/finance/screener/predefined/saved?scrIds=most_actives&count=12";
  let lastErr = null;
  for (const host of YF_HOSTS) {
    try {
      const res = await fetch(host + path, {
        headers: { "User-Agent": "Mozilla/5.0" },
        cache: "no-store",
      });
      if (!res.ok) { lastErr = `HTTP ${res.status}`; continue; }
      const json = await res.json();
      const quotes = json?.finance?.result?.[0]?.quotes || [];
      const movers = quotes
        .filter((q) => q.symbol && q.quoteType === "EQUITY" && typeof q.regularMarketPrice === "number")
        .slice(0, 8)
        .map((q) => ({
          symbol: q.symbol,
          name: q.shortName || q.longName || q.symbol,
          price: q.regularMarketPrice,
          changePct: typeof q.regularMarketChangePercent === "number" ? q.regularMarketChangePercent : null,
          currency: q.currency || "USD",
        }));
      return Response.json(
        { ok: true, movers, fetchedAt: Date.now() },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (e) {
      lastErr = e?.message || String(e);
    }
  }
  return Response.json({ ok: false, error: lastErr || "unknown", movers: [] }, { status: 502 });
}
