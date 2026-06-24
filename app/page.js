"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./globals.css";
import {
  FIXED,
  DEFAULT_WATCHLIST,
  KR_PRESET,
  US_PRESET,
  DESCRIPTIONS,
  TAGLINES,
} from "./lib/symbols";

const REFRESH_MS = 30000;
const STORAGE_KEY = "watchlist_v2";
const MAX_WATCH = 40;

const FIXED_GROUPS = [
  { key: "us_index", title: "미국 주요 지수" },
  { key: "kr_index", title: "한국 주요 지수" },
];

const FX_SYMBOL = "KRW=X";
const isKorean = (sym) => /\.K[SQ]$/.test(sym);

/* ---------- 포맷 ---------- */
function decimals(v, currency) {
  return currency === "KRW" && Number.isInteger(v) ? 0 : 2;
}
function fmtPrice(v, currency) {
  if (v == null || Number.isNaN(v)) return "—";
  const d = decimals(v, currency);
  return v.toLocaleString("ko-KR", { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtSigned(v, currency) {
  if (v == null || Number.isNaN(v)) return "—";
  const d = decimals(v, currency);
  const sign = v > 0 ? "+" : "";
  return sign + v.toLocaleString("ko-KR", { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtPct(v) {
  if (v == null || Number.isNaN(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}
function fmtTime(ms) {
  if (!ms) return "—";
  return new Date(ms).toLocaleString("ko-KR", {
    hour12: false, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}
function trendClass(change) {
  if (change == null) return "nodata";
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}
function marketBadge(state) {
  switch (state) {
    case "REGULAR": return { text: "● 장중", open: true };
    case "PRE": return { text: "프리장", open: false };
    case "POST": case "POSTPOST": return { text: "애프터", open: false };
    case "CLOSED": case "PREPRE": return { text: "장마감", open: false };
    default: return null;
  }
}
// hover 설명: 사전 우선, 없으면 종목명+시장으로 자동 구성
function descFor(symbol, quote, label) {
  if (DESCRIPTIONS[symbol]) return DESCRIPTIONS[symbol];
  const name = (quote && quote.name) || label || symbol;
  let market = "";
  if (symbol.endsWith(".KS")) market = "코스피 상장";
  else if (symbol.endsWith(".KQ")) market = "코스닥 상장";
  else if (quote && quote.currency === "USD") market = "미국 증시 상장";
  else if (quote && quote.currency) market = `${quote.currency} 거래`;
  return market ? `${name} — ${market} 종목` : name;
}

/* ---------- 스파크라인 ---------- */
function Sparkline({ series, change }) {
  const width = 200, height = 38;
  if (!series || series.length < 2) return null;
  const vals = series.map((p) => p.c);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const stepX = width / (series.length - 1);
  const points = series.map((p, i) => {
    const x = i * stepX;
    const y = height - ((p.c - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const color = change > 0 ? "var(--up)" : change < 0 ? "var(--down)" : "var(--flat)";
  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- 모달 상세 차트 (호버 시 가격 표시) ---------- */
function DetailChart({ series, prevClose, currency }) {
  const width = 700, height = 280, padL = 60, padR = 16, padT = 16, padB = 28;
  const [hover, setHover] = useState(null);

  if (!series || series.length < 2) {
    return <div className="loading-text">표시할 가격 데이터가 없습니다.</div>;
  }
  const vals = series.map((p) => p.c);
  let min = Math.min(...vals), max = Math.max(...vals);
  if (prevClose != null) { min = Math.min(min, prevClose); max = Math.max(max, prevClose); }
  const range = max - min || 1;
  const innerW = width - padL - padR, innerH = height - padT - padB;
  const x = (i) => padL + (i / (series.length - 1)) * innerW;
  const y = (v) => padT + innerH - ((v - min) / range) * innerH;
  const first = series[0].c, last = series[series.length - 1].c;
  const up = last >= first;
  const color = up ? "var(--up)" : "var(--down)";
  const linePts = series.map((p, i) => `${x(i).toFixed(1)},${y(p.c).toFixed(1)}`).join(" ");
  const areaPts = `${padL},${padT + innerH} ${linePts} ${padL + innerW},${padT + innerH}`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => min + f * range);

  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width;
    let idx = Math.round(fx * (series.length - 1));
    idx = Math.max(0, Math.min(series.length - 1, idx));
    setHover(idx);
  }
  const hp = hover != null ? series[hover] : null;
  const hx = hp ? x(hover) : 0, hy = hp ? y(hp.c) : 0;

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: "block" }}>
        {ticks.map((tv, i) => {
          const yy = y(tv);
          return (
            <g key={i}>
              <line x1={padL} x2={padL + innerW} y1={yy} y2={yy} stroke="var(--border)" strokeWidth="1" />
              <text x={padL - 8} y={yy + 3} fill="var(--muted)" fontSize="10" textAnchor="end">{fmtPrice(tv, currency)}</text>
            </g>
          );
        })}
        {prevClose != null && (
          <line x1={padL} x2={padL + innerW} y1={y(prevClose)} y2={y(prevClose)} stroke="var(--flat)" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
        )}
        <polygon points={areaPts} fill={color} opacity="0.08" />
        <polyline points={linePts} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
        {hp && (
          <g>
            <line x1={hx} x2={hx} y1={padT} y2={padT + innerH} stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={hx} cy={hy} r="3.5" fill={color} stroke="var(--bg)" strokeWidth="1.5" />
          </g>
        )}
        <rect x={padL} y={padT} width={innerW} height={innerH} fill="transparent" onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
      </svg>
      {hp && (
        <div className="chart-tip" style={{ left: `${(hx / width) * 100}%`, top: `${(hy / height) * 100}%` }}>
          <div className="tip-price">{fmtPrice(hp.c, currency)}</div>
          <div className="tip-time">
            {new Date(hp.t).toLocaleString("ko-KR", { hour12: false, month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      )}
    </div>
  );
}

const RANGES = [
  { key: "1d", label: "1일" }, { key: "5d", label: "5일" }, { key: "1mo", label: "1개월" },
  { key: "6mo", label: "6개월" }, { key: "1y", label: "1년" },
];

function useEscClose(onClose) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
}

function DetailModal({ item, onClose }) {
  const [range, setRange] = useState("1mo");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  useEscClose(onClose);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);
    fetch(`/api/history?symbol=${encodeURIComponent(item.symbol)}&range=${range}`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j.ok) setData(j);
        else { setErr(j.error || "불러오기 실패"); setData(null); }
      })
      .catch((e) => { if (alive) { setErr(e.message); setData(null); } })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [item.symbol, range]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">
            {item.label} <span style={{ color: "var(--dim)", fontSize: 12 }}>{item.symbol}</span>
          </div>
          <button className="modal-close" onClick={onClose}>✕ 닫기</button>
        </div>
        <div className="modal-body">
          {DESCRIPTIONS[item.symbol] && (
            <div style={{ color: "var(--muted)", fontSize: 12.5, marginBottom: 12, lineHeight: 1.5 }}>
              {DESCRIPTIONS[item.symbol]}
            </div>
          )}
          <div className="range-tabs">
            {RANGES.map((r) => (
              <button key={r.key} className={`range-tab ${range === r.key ? "active" : ""}`} onClick={() => setRange(r.key)}>{r.label}</button>
            ))}
          </div>
          {loading && <div className="loading-text">불러오는 중…</div>}
          {!loading && err && <div className="loading-text">데이터 없음 ({err})</div>}
          {!loading && !err && data && (
            <>
              <DetailChart series={data.series} prevClose={data.prevClose} currency={data.currency} />
              <div style={{ color: "var(--dim)", fontSize: 11, marginTop: 10 }}>
                점선 = 전일 종가 · 그래프 위에 마우스를 올리면 시점별 가격이 표시됩니다.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- 검색/추가 모달 ---------- */
function SearchModal({ onClose, onAdd, existing }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const has = (sym) => existing.includes(sym);
  useEscClose(onClose);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 1) { setResults([]); setSearched(false); return; }
    let alive = true;
    setLoading(true);
    const id = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}`)
        .then((r) => r.json())
        .then((j) => { if (alive) { setResults(j.results || []); setSearched(true); } })
        .catch(() => alive && setResults([]))
        .finally(() => alive && setLoading(false));
    }, 320);
    return () => { alive = false; clearTimeout(id); };
  }, [q]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">관심 종목 추가</div>
          <button className="modal-close" onClick={onClose}>✕ 닫기</button>
        </div>
        <div className="modal-body">
          <input
            className="search-input"
            placeholder="종목명·코드로 검색  (예: 삼성전자, 카카오, apple, nvidia, 005930.KS)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />
          <div className="search-hint">
            한국 주요 종목은 한글로도 검색됩니다(삼성전자, 카카오 등). 그 외 종목은 영문명·코드로 검색하세요.
          </div>

          {q.trim().length === 0 && (
            <>
              <div className="preset-block">
                <div className="preset-title">한국 대표 종목</div>
                <div className="chips">
                  {KR_PRESET.map((p) => (
                    <button key={p.symbol} className={`chip ${has(p.symbol) ? "added" : ""}`} disabled={has(p.symbol)} onClick={() => onAdd(p)}>
                      {has(p.symbol) ? "✓ " : "+ "}{p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="preset-block">
                <div className="preset-title">미국 대표 종목</div>
                <div className="chips">
                  {US_PRESET.map((p) => (
                    <button key={p.symbol} className={`chip ${has(p.symbol) ? "added" : ""}`} disabled={has(p.symbol)} onClick={() => onAdd(p)}>
                      {has(p.symbol) ? "✓ " : "+ "}{p.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {q.trim().length > 0 && (
            <div className="results">
              {loading && <div className="loading-text">검색 중…</div>}
              {!loading && searched && results.length === 0 && (
                <div className="loading-text">검색 결과가 없습니다. (한글 검색이 안 되면 영문명/코드로 시도)</div>
              )}
              {!loading && results.map((r) => (
                <div className="result-row" key={r.symbol}>
                  <div className="result-meta">
                    <span className="result-name">{r.name}</span>
                    <span className="result-sub">
                      {r.symbol}{r.exchange ? ` · ${r.exchange}` : ""}{r.type ? ` · ${r.type}` : ""}
                    </span>
                  </div>
                  <button className="result-add" disabled={has(r.symbol)} onClick={() => onAdd({ symbol: r.symbol, label: r.name })}>
                    {has(r.symbol) ? "✓ 추가됨" : "+ 추가"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- 카드 ---------- */
function Card({ meta, quote, onClick, editable, onDelete, onToggleFav, fav, onTip }) {
  const loaded = quote !== undefined;
  const ok = loaded && quote.ok;
  const change = ok ? quote.change : null;
  const cls = trendClass(change);
  const clickable = ok; // series 유무와 무관하게, 시세가 있으면 차트 열기
  const display = meta.label || (quote && quote.name) || meta.symbol;
  const badge = ok ? marketBadge(quote.marketState) : null;
  const desc = descFor(meta.symbol, quote, display);

  return (
    <div
      className={`card ${cls} ${editable ? "editable" : ""} ${fav ? "fav" : ""}`}
      onClick={() => clickable && onClick({ ...meta, label: display })}
      onMouseEnter={(e) => onTip(desc, e.clientX, e.clientY)}
      onMouseMove={(e) => onTip(desc, e.clientX, e.clientY)}
      onMouseLeave={() => onTip(null)}
    >
      {editable && (
        <div className="card-corner">
          <button
            className="card-del"
            title="관심 종목에서 삭제"
            onClick={(e) => { e.stopPropagation(); onTip(null); onDelete(meta.symbol); }}
          >✕</button>
          <button
            className={`star ${fav ? "on" : ""}`}
            title={fav ? "보유 종목 고정 해제" : "보유 종목으로 맨 앞에 고정"}
            onClick={(e) => { e.stopPropagation(); onToggleFav(meta.symbol); }}
          >{fav ? "★" : "☆"}</button>
        </div>
      )}
      <div className="card-head">
        <span className="card-label">{display}</span>
        {!editable && <span className="card-symbol">{meta.symbol}</span>}
      </div>
      {editable && <div className="card-symbol sym-line">{meta.symbol}</div>}

      {!loaded ? (
        <div className="card-skel">· · ·</div>
      ) : !ok ? (
        <div className="nodata-text">데이터 없음</div>
      ) : (
        <>
          <div className="card-price">
            {fmtPrice(quote.price, quote.currency)}
            {quote.currency && <span className="curr-tag"> {quote.currency}</span>}
          </div>
          <div className="card-change">
            <span className={`${cls}-text`}>
              <span className="arrow">{change > 0 ? "▲" : change < 0 ? "▼" : "—"}</span> {fmtSigned(change, quote.currency)}
            </span>
            <span className={`${cls}-text`}>{fmtPct(quote.changePct)}</span>
            {badge && <span className={`mkt-badge ${badge.open ? "open" : ""}`}>{badge.text}</span>}
          </div>
          <Sparkline series={quote.series} change={change} />
        </>
      )}
    </div>
  );
}

/* ---------- 회전 문구 ---------- */
function Tagline() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(false);
  useEffect(() => {
    setIdx(Math.floor(Math.random() * TAGLINES.length));
    const t = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % TAGLINES.length);
        setFade(false);
      }, 400);
    }, 7000);
    return () => clearInterval(t);
  }, []);
  return <div className={`tagline ${fade ? "fade" : ""}`}>{TAGLINES[idx]}</div>;
}

/* ---------- 페이지 ---------- */
export default function Page() {
  const [watch, setWatch] = useState(null);
  const [quotes, setQuotes] = useState({});
  const [fetchedAt, setFetchedAt] = useState(null);
  const [status, setStatus] = useState("loading");
  const [selected, setSelected] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [tip, setTip] = useState(null); // {text,x,y}
  const timerRef = useRef(null);

  const onTip = useCallback((text, x, y) => {
    setTip(text ? { text, x, y } : null);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) { setWatch(arr); return; }
      }
    } catch {}
    setWatch(DEFAULT_WATCHLIST);
  }, []);

  useEffect(() => {
    if (watch == null) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(watch)); } catch {}
  }, [watch]);

  const allSymbols = useMemo(() => {
    const fixed = FIXED.map((f) => f.symbol);
    const w = (watch || []).map((s) => s.symbol);
    return [...fixed, ...w];
  }, [watch]);

  const load = useCallback(async () => {
    if (allSymbols.length === 0) return;
    try {
      const res = await fetch(`/api/quotes?symbols=${encodeURIComponent(allSymbols.join(","))}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const map = {};
      for (const q of json.quotes) map[q.symbol] = q;
      setQuotes(map);
      setFetchedAt(json.fetchedAt);
      setStatus(json.quotes.some((q) => q.ok) ? "live" : "error");
    } catch {
      setStatus("error");
    }
  }, [allSymbols]);

  useEffect(() => {
    if (watch == null) return;
    load();
    clearInterval(timerRef.current);
    timerRef.current = setInterval(load, REFRESH_MS);
    return () => clearInterval(timerRef.current);
  }, [load, watch]);

  const addItem = useCallback((item) => {
    setWatch((prev) => {
      const list = prev || [];
      if (list.some((x) => x.symbol === item.symbol)) return list;
      if (list.length >= MAX_WATCH) return list;
      return [...list, { symbol: item.symbol, label: item.label }];
    });
  }, []);

  const removeItem = useCallback((symbol) => {
    setWatch((prev) => (prev || []).filter((x) => x.symbol !== symbol));
  }, []);

  const toggleFav = useCallback((symbol) => {
    setWatch((prev) =>
      (prev || []).map((x) => (x.symbol === symbol ? { ...x, fav: !x.fav } : x))
    );
  }, []);

  const favFirst = (list) =>
    [...list].sort((a, b) => (b.fav ? 1 : 0) - (a.fav ? 1 : 0));

  const goHome = useCallback(() => {
    setSelected(null);
    setShowSearch(false);
    setTip(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    load();
  }, [load]);

  const statusText = status === "loading" ? "불러오는 중" : status === "live" ? "실시간" : "연결 오류";
  const existingSymbols = (watch || []).map((s) => s.symbol);

  const fxQuote = quotes[FX_SYMBOL];
  const fxOk = fxQuote && fxQuote.ok;
  const fxCls = fxOk ? trendClass(fxQuote.change) : "flat";
  const usWatch = favFirst((watch || []).filter((s) => !isKorean(s.symbol)));
  const krWatch = favFirst((watch || []).filter((s) => isKorean(s.symbol)));

  return (
    <div className="wrap">
      <div className="topbar">
        <button className="brand" onClick={goHome} title="홈으로">
          <div>
            <h1>US/KR MARKET TERMINAL</h1>
            <Tagline />
          </div>
        </button>
        <div className="top-right">
          <div
            className="fx-chip"
            onClick={() => fxOk && setSelected({ symbol: FX_SYMBOL, label: "원·달러 환율" })}
            onMouseEnter={(e) => onTip(descFor(FX_SYMBOL, fxQuote, "원·달러 환율"), e.clientX, e.clientY)}
            onMouseMove={(e) => onTip(descFor(FX_SYMBOL, fxQuote, "원·달러 환율"), e.clientX, e.clientY)}
            onMouseLeave={() => onTip(null)}
            title="클릭하면 환율 차트"
          >
            <span className="fx-label">환율 $1 =</span>
            {fxOk ? (
              <>
                <span>₩{fmtPrice(fxQuote.price, "KRW")}</span>
                <span className={`${fxCls}-text`}>
                  {fxQuote.change > 0 ? "▲" : fxQuote.change < 0 ? "▼" : "—"} {fmtPct(fxQuote.changePct)}
                </span>
              </>
            ) : (
              <span className="fx-label">—</span>
            )}
          </div>
          <div className="status">
            <span><span className={`dot ${status}`} />{statusText}</span>
            <span>갱신 {fmtTime(fetchedAt)}</span>
            <button className="refresh-btn" onClick={load} disabled={status === "loading"}>↻ 새로고침</button>
          </div>
        </div>
      </div>

      {FIXED_GROUPS.map((g) => {
        const items = FIXED.filter((s) => s.group === g.key);
        if (items.length === 0) return null;
        return (
          <section key={g.key}>
            <div className="section-title">{g.title}</div>
            <div className="grid">
              {items.map((meta) => (
                <Card key={meta.symbol} meta={meta} quote={quotes[meta.symbol]} onClick={setSelected} onTip={onTip} />
              ))}
            </div>
          </section>
        );
      })}

      <section>
        <div className="section-row">
          <div className="section-title">관심 종목 (내 편집)</div>
          <button className="add-btn" onClick={() => setShowSearch(true)}>＋ 종목 추가 / 검색</button>
        </div>
        <div className="empty-hint" style={{ marginTop: -2 }}>
          ☆ 별을 누르면 보유 종목으로 표시되어 해당 영역 맨 앞에 고정돼요.
        </div>
        {watch != null && watch.length === 0 && (
          <div className="empty-hint">관심 종목이 없습니다. 오른쪽 위 “＋ 종목 추가 / 검색”으로 종목을 담아보세요.</div>
        )}

        {watch != null && (
          <>
            <div className="sub-title">
              <span className="flag">🇺🇸</span> 미국 종목 <span className="count">({usWatch.length})</span>
            </div>
            <div className="grid">
              {usWatch.map((meta) => (
                <Card
                  key={meta.symbol}
                  meta={meta}
                  quote={quotes[meta.symbol]}
                  onClick={setSelected}
                  editable
                  fav={meta.fav}
                  onDelete={removeItem}
                  onToggleFav={toggleFav}
                  onTip={onTip}
                />
              ))}
              <button className="add-card" onClick={() => setShowSearch(true)}>＋ 추가</button>
            </div>

            <div className="sub-title">
              <span className="flag">🇰🇷</span> 한국 종목 <span className="count">({krWatch.length})</span>
            </div>
            <div className="grid">
              {krWatch.map((meta) => (
                <Card
                  key={meta.symbol}
                  meta={meta}
                  quote={quotes[meta.symbol]}
                  onClick={setSelected}
                  editable
                  fav={meta.fav}
                  onDelete={removeItem}
                  onToggleFav={toggleFav}
                  onTip={onTip}
                />
              ))}
              <button className="add-card" onClick={() => setShowSearch(true)}>＋ 추가</button>
            </div>
          </>
        )}
      </section>

      <div className="foot">
        데이터: Yahoo Finance 공개 엔드포인트 (무료 · API 키 없음) · 미국/한국 주식·지수, 원·달러(KRW=X).
        <br />
        30초마다 자동 갱신 · 상승=빨강, 하락=파랑 · 카드에 마우스를 올리면 한 줄 설명이 떠요 ·
        카드를 클릭하면 가격 추이 차트(마우스 올리면 시점별 가격) · 관심 종목은 이 브라우저에 저장됩니다.
      </div>

      {selected && <DetailModal item={selected} onClose={() => setSelected(null)} />}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} onAdd={addItem} existing={existingSymbols} />}

      {tip && (
        <div className="hover-tip" style={{ left: tip.x + 14, top: tip.y + 16 }}>{tip.text}</div>
      )}
    </div>
  );
}
