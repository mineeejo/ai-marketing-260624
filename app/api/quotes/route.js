// 브라우저에서 직접 부르면 CORS로 막히는 Yahoo Finance 공개 엔드포인트를
// 서버(라우트 핸들러)에서 프록시한다. API 키가 필요 없는 무료 공개 API.
// 클라이언트가 ?symbols=a,b,c 로 보고 싶은 종목 목록을 넘긴다(관심종목 편집 지원).
export const dynamic = "force-dynamic";
export const revalidate = 0;

const YF_HOSTS = [
  "https://query1.finance.yahoo.com",
  "https://query2.finance.yahoo.com",
];

const MAX_SYMBOLS = 60;

async function fetchOne(symbol) {
  const enc = encodeURIComponent(symbol);
  const path = `/v8/finance/chart/${enc}?range=1d&interval=5m`;

  let lastErr = null;
  for (const host of YF_HOSTS) {
    try {
      const res = await fetch(host + path, {
        headers: { "User-Agent": "Mozilla/5.0" },
        cache: "no-store",
      });
      if (!res.ok) {
        lastErr = `HTTP ${res.status}`;
        continue;
      }
      const json = await res.json();
      const result = json?.chart?.result?.[0];
      const meta = result?.meta;
      if (!meta || typeof meta.regularMarketPrice !== "number") {
        lastErr = "no price in response";
        continue;
      }

      const prevClose =
        typeof meta.chartPreviousClose === "number"
          ? meta.chartPreviousClose
          : typeof meta.previousClose === "number"
          ? meta.previousClose
          : null;

      const ts = result?.timestamp || [];
      const closes = result?.indicators?.quote?.[0]?.close || [];
      const series = [];
      for (let i = 0; i < ts.length; i++) {
        const c = closes[i];
        if (typeof c === "number") series.push({ t: ts[i], c });
      }

      const price = meta.regularMarketPrice;
      const change = prevClose != null ? price - prevClose : null;
      const changePct =
        prevClose != null && prevClose !== 0 ? (change / prevClose) * 100 : null;

      return {
        symbol,
        ok: true,
        name: meta.shortName || meta.longName || null,
        price,
        prevClose,
        change,
        changePct,
        currency: meta.currency || null,
        marketState: meta.marketState || null,
        marketTime:
          typeof meta.regularMarketTime === "number"
            ? meta.regularMarketTime * 1000
            : null,
        series,
      };
    } catch (e) {
      lastErr = e?.message || String(e);
    }
  }
  return { symbol, ok: false, error: lastErr || "unknown error" };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("symbols") || "";
  const symbols = [
    ...new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  ].slice(0, MAX_SYMBOLS);

  if (symbols.length === 0) {
    return Response.json(
      { fetchedAt: Date.now(), quotes: [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const results = await Promise.all(symbols.map((s) => fetchOne(s)));
  return Response.json(
    { fetchedAt: Date.now(), quotes: results },
    { headers: { "Cache-Control": "no-store" } }
  );
}
