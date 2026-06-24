import { KR_STOCKS } from "../../lib/symbols";

// 종목 검색 (Yahoo Finance 공개 search 엔드포인트 프록시, 키 없음).
// 한글 검색어는 Yahoo가 거부하므로, 한글이 들어오면 로컬 한글명↔티커 사전으로 매칭한다.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const HANGUL = /[가-힣]/;

function exchangeFromSymbol(sym) {
  if (sym.endsWith(".KS")) return "코스피";
  if (sym.endsWith(".KQ")) return "코스닥";
  return "";
}

function searchKorean(q) {
  const term = q.replace(/\s+/g, "");
  return KR_STOCKS.filter((s) => s.ko.replace(/\s+/g, "").includes(term))
    .slice(0, 10)
    .map((s) => ({
      symbol: s.symbol,
      name: s.ko.split(" ")[0],
      type: "EQUITY",
      exchange: exchangeFromSymbol(s.symbol),
    }));
}

const YF_HOSTS = [
  "https://query1.finance.yahoo.com",
  "https://query2.finance.yahoo.com",
];

// 거래소 코드 -> 한국어 표기
const EXCHANGE_LABEL = {
  NMS: "나스닥",
  NGM: "나스닥",
  NCM: "나스닥",
  NYQ: "뉴욕(NYSE)",
  PCX: "NYSE Arca",
  ASE: "NYSE American",
  KSC: "코스피",
  KOE: "코스닥",
  TYO: "도쿄",
  HKG: "홍콩",
  LSE: "런던",
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  if (q.length < 1) {
    return Response.json({ ok: true, results: [] });
  }

  // 한글 검색어는 로컬 사전으로 처리 (Yahoo가 한글을 거부)
  if (HANGUL.test(q)) {
    return Response.json(
      { ok: true, results: searchKorean(q), source: "ko-dict" },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const path = `/v1/finance/search?q=${encodeURIComponent(
    q
  )}&quotesCount=10&newsCount=0&enableFuzzyQuery=false`;

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
      const quotes = Array.isArray(json?.quotes) ? json.quotes : [];
      const results = quotes
        .filter((it) => it.symbol && (it.quoteType === "EQUITY" || it.quoteType === "ETF" || it.quoteType === "INDEX" || it.quoteType === "CURRENCY"))
        .map((it) => ({
          symbol: it.symbol,
          name: it.shortname || it.longname || it.symbol,
          type: it.quoteType,
          exchange: EXCHANGE_LABEL[it.exchange] || it.exchDisp || it.exchange || "",
        }));
      return Response.json(
        { ok: true, results },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (e) {
      lastErr = e?.message || String(e);
    }
  }
  return Response.json(
    { ok: false, error: lastErr || "unknown", results: [] },
    { status: 502 }
  );
}
