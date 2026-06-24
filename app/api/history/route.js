// 종목 클릭 시 보여줄 가격 추이 차트 데이터. 역시 Yahoo 공개 엔드포인트를 서버에서 프록시.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const YF_HOSTS = [
  "https://query1.finance.yahoo.com",
  "https://query2.finance.yahoo.com",
];

// range -> interval 매핑 (Yahoo 허용 조합)
const RANGE_INTERVAL = {
  "1d": "5m",
  "5d": "30m",
  "1mo": "1d",
  "6mo": "1d",
  "1y": "1d",
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const range = searchParams.get("range") || "1mo";

  if (!symbol || !/^[A-Za-z0-9.\-=^]{1,15}$/.test(symbol)) {
    return Response.json({ ok: false, error: "유효하지 않은 종목" }, { status: 400 });
  }
  const interval = RANGE_INTERVAL[range] || "1d";
  const enc = encodeURIComponent(symbol);
  const path = `/v8/finance/chart/${enc}?range=${range}&interval=${interval}`;

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
      const ts = result?.timestamp || [];
      const closes = result?.indicators?.quote?.[0]?.close || [];
      const meta = result?.meta;
      const series = [];
      for (let i = 0; i < ts.length; i++) {
        const c = closes[i];
        if (typeof c === "number") series.push({ t: ts[i] * 1000, c });
      }
      if (series.length === 0) {
        lastErr = "no series in response";
        continue;
      }
      return Response.json(
        {
          ok: true,
          symbol,
          range,
          currency: meta?.currency || null,
          prevClose:
            typeof meta?.chartPreviousClose === "number"
              ? meta.chartPreviousClose
              : null,
          series,
          fetchedAt: Date.now(),
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (e) {
      lastErr = e?.message || String(e);
    }
  }
  return Response.json({ ok: false, symbol, error: lastErr || "unknown" }, { status: 502 });
}
