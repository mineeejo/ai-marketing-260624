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
  GLOSSARY,
  TIPS,
} from "./lib/symbols";

const REFRESH_MS = 30000;
const STORAGE_KEY = "watchlist_v2";
const PF_KEY = "portfolio_v1";
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

const RANGE_LABEL = { "1d": "1일", "5d": "5일", "1mo": "1개월", "6mo": "6개월", "1y": "1년" };

function fmtVol(v) {
  if (v == null) return "—";
  if (v >= 1e8) return (v / 1e8).toFixed(1) + "억 주";
  if (v >= 1e4) return Math.round(v / 1e4).toLocaleString("ko-KR") + "만 주";
  return v.toLocaleString("ko-KR") + " 주";
}
function timeAgo(ms) {
  if (!ms) return "";
  const diff = Date.now() - ms;
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "방금";
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}
// 실제 가격 데이터로만 만든 2~3문장 동향 요약 (원인을 지어내지 않음).
function summarize(data) {
  const s = data.series;
  const st = data.stats;
  if (!s || s.length < 2) return null;
  const parts = [];

  // 1) 오늘 (전일 종가 대비)
  if (st && st.price != null && data.prevClose != null && data.prevClose !== 0) {
    const t = ((st.price - data.prevClose) / data.prevClose) * 100;
    const w = t > 0.05 ? `+${t.toFixed(2)}% 올라` : t < -0.05 ? `${t.toFixed(2)}% 내려` : "거의 변동 없이";
    parts.push(`오늘은 전일 대비 ${w} 거래되고 있어요.`);
  }
  // 2) 선택한 기간 추세
  const first = s[0].c, last = s[s.length - 1].c;
  if (first) {
    const p = ((last - first) / first) * 100;
    const label = RANGE_LABEL[data.range] || "최근";
    const w = p > 0.05 ? `+${p.toFixed(2)}% 상승` : p < -0.05 ? `${p.toFixed(2)}% 하락` : "보합";
    parts.push(`${label} 기준으로는 ${w} 흐름이에요.`);
  }
  // 3) 52주(1년) 위치
  if (st && st.week52Low != null && st.week52High != null && st.price != null && st.week52High > st.week52Low) {
    const pos = ((st.price - st.week52Low) / (st.week52High - st.week52Low)) * 100;
    const zone = pos < 33 ? "1년 범위에서 낮은 편(바닥권)" : pos > 66 ? "1년 범위에서 높은 편(고점권)" : "1년 범위의 중간쯤";
    parts.push(`현재가는 ${zone}이에요 (1년 범위의 ${pos.toFixed(0)}% 지점).`);
  }
  return parts.length ? parts.join(" ") : null;
}

function Week52Bar({ stats, currency }) {
  if (!stats) return null;
  const { week52Low: lo, week52High: hi, price } = stats;
  if (lo == null || hi == null || price == null || hi <= lo) return null;
  const pos = Math.max(0, Math.min(100, ((price - lo) / (hi - lo)) * 100));
  const zone = pos < 33 ? "1년 기준 싼 편(바닥권)" : pos > 66 ? "1년 기준 비싼 편(고점권)" : "1년 기준 중간쯤";
  return (
    <div className="w52">
      <div className="w52-head">
        <span title="최근 1년간 가장 낮았던 가격">52주 최저 {fmtPrice(lo, currency)}</span>
        <span title="최근 1년간 가장 높았던 가격">52주 최고 {fmtPrice(hi, currency)}</span>
      </div>
      <div className="w52-track">
        <div className="w52-fill" style={{ width: `${pos}%` }} />
        <div className="w52-marker" style={{ left: `${pos}%` }} title="현재가 위치" />
      </div>
      <div className="w52-ends">
        <span>← 1년 최저(싼 편)</span>
        <span>1년 최고(비싼 편) →</span>
      </div>
      <div className="w52-cap">
        지난 1년 가격 범위에서 <b style={{ color: "var(--accent)" }}>지금 가격이 어디쯤인지</b> 보여줘요.
        현재가 <b>{fmtPrice(price, currency)}</b> = 범위의 <b>{pos.toFixed(0)}%</b> 지점 ({zone}).
      </div>
    </div>
  );
}

function StatGrid({ stats, currency }) {
  if (!stats) return null;
  const items = [
    { k: "일중 최고", v: fmtPrice(stats.dayHigh, currency), tip: "오늘 장중 가장 높았던 가격" },
    { k: "일중 최저", v: fmtPrice(stats.dayLow, currency), tip: "오늘 장중 가장 낮았던 가격" },
    { k: "거래량", v: fmtVol(stats.volume), tip: "오늘 사고팔린 주식 수. 많을수록 시장 관심이 큽니다" },
  ];
  return (
    <div className="stat-grid">
      {items.map((it) => (
        <div className="stat-item" key={it.k} title={it.tip}>
          <span className="stat-k">{it.k} <span className="info-i">ⓘ</span></span>
          <span className="stat-v">{it.v}</span>
        </div>
      ))}
    </div>
  );
}

function DetailModal({ item, onClose }) {
  const [range, setRange] = useState("1mo");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [news, setNews] = useState(null);
  useEscClose(onClose);
  const kr = isKorean(item.symbol);

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

  useEffect(() => {
    let alive = true;
    setNews(null);
    fetch(`/api/news?symbol=${encodeURIComponent(item.symbol)}`)
      .then((r) => r.json())
      .then((j) => { if (alive) setNews(j); })
      .catch(() => { if (alive) setNews({ ok: false, supported: !kr, news: [] }); });
    return () => { alive = false; };
  }, [item.symbol, kr]);

  const summary = data && !err ? summarize(data) : null;

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
              {summary && (
                <div className="summary-box">
                  <span className="summary-tag">📊 현황 요약</span>
                  <span>{summary}</span>
                </div>
              )}
              <DetailChart series={data.series} prevClose={data.prevClose} currency={data.currency} />
              <div style={{ color: "var(--dim)", fontSize: 11, marginTop: 8 }}>
                점선 = 전일 종가 · 그래프 위에 마우스를 올리면 시점별 가격이 표시됩니다.
              </div>
              <Week52Bar stats={data.stats} currency={data.currency} />
              <StatGrid stats={data.stats} currency={data.currency} />
            </>
          )}

          {/* 위 '현황 요약'은 실제 가격 데이터 기반. 기사 원문은 아이콘 링크로만 제공(미국 종목) */}
          {!kr && news && news.news && news.news.length > 0 && (
            <div className="news-mini">
              <span className="news-mini-label">📰 관련 기사(영문·Yahoo):</span>
              {news.news.slice(0, 5).map((n, i) => (
                <a
                  key={i}
                  className="news-ico"
                  href={n.link}
                  target="_blank"
                  rel="noreferrer"
                  title={`${n.title}${n.publisher ? ` · ${n.publisher}` : ""}${n.time ? ` · ${timeAgo(n.time)}` : ""}`}
                >🔗</a>
              ))}
            </div>
          )}
          {kr && (
            <div className="news-mini">
              <span className="news-mini-label">📰 한국 종목 뉴스는 무료 소스 신뢰도가 낮아 생략 — 위 동향 요약을 참고하세요.</span>
            </div>
          )}

          <div className="disclaimer">
            ⚠ ‘현황 요약’은 실제 가격 데이터로 계산한 사실이며, 매매 추천이 아닙니다. 투자 판단과 책임은 본인에게 있습니다.
          </div>
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

/* ---------- 가이드: 용어사전 + 초보 꿀팁 ---------- */
function GuideModal({ onClose }) {
  const [tab, setTab] = useState("tips");
  useEscClose(onClose);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">📖 주린이 가이드</div>
          <button className="modal-close" onClick={onClose}>✕ 닫기</button>
        </div>
        <div className="modal-body">
          <div className="guide-tabs">
            <button className={`range-tab ${tab === "tips" ? "active" : ""}`} onClick={() => setTab("tips")}>초보 꿀팁</button>
            <button className={`range-tab ${tab === "glossary" ? "active" : ""}`} onClick={() => setTab("glossary")}>용어사전</button>
          </div>
          {tab === "tips" ? (
            <div>
              {TIPS.map((t) => (
                <div className="tip-card" key={t.title}>
                  <div className="tip-title">💡 {t.title}</div>
                  <div className="tip-body">{t.body}</div>
                </div>
              ))}
              <div className="disclaimer">⚠ 일반적인 투자 원칙 안내이며, 특정 종목 매수 추천이 아닙니다.</div>
            </div>
          ) : (
            <div>
              {GLOSSARY.map((g) => (
                <div className="gl-item" key={g.term}>
                  <div className="gl-term">{g.term}</div>
                  <div className="gl-desc">{g.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- 보유 포트폴리오 ---------- */
function fmtKRW(v) {
  if (v == null || Number.isNaN(v)) return "—";
  const sign = v < 0 ? "-" : "";
  return `${sign}₩${Math.round(Math.abs(v)).toLocaleString("ko-KR")}`;
}
function fmtKRWsigned(v) {
  if (v == null || Number.isNaN(v)) return "—";
  const sign = v > 0 ? "+" : v < 0 ? "-" : "";
  return `${sign}₩${Math.round(Math.abs(v)).toLocaleString("ko-KR")}`;
}

// 보유종목 + 실시간 시세 + 환율로 포트폴리오 분석 계산
function computePortfolio(holdings, quotes, usdkrw) {
  let totalValueKRW = 0, valUS = 0, valKR = 0;
  let plKRW = 0, costForPLKRW = 0, todayKRW = 0;
  let hasUnknownFx = false;

  const rows = holdings.map((h) => {
    const q = quotes[h.symbol];
    const ok = q && q.ok;
    const cur = ok ? q.currency : isKorean(h.symbol) ? "KRW" : "USD";
    const isUSD = cur === "USD" || (cur !== "KRW" && !isKorean(h.symbol));
    const toKRW = (v) => {
      if (v == null) return null;
      if (!isUSD) return v;
      if (!usdkrw) { hasUnknownFx = true; return null; }
      return v * usdkrw;
    };
    const price = ok ? q.price : null;
    const qty = Number(h.qty) || 0;
    const avg = h.avg != null && h.avg !== "" ? Number(h.avg) : null;
    const value = price != null ? price * qty : null;
    const plNative = price != null && avg != null ? (price - avg) * qty : null;
    const plPct = price != null && avg ? ((price - avg) / avg) * 100 : null;
    const todayNative = ok && q.change != null ? q.change * qty : null;
    const valueKRW = toKRW(value);

    if (valueKRW != null) {
      totalValueKRW += valueKRW;
      if (isUSD) valUS += valueKRW; else valKR += valueKRW;
    }
    if (plNative != null) { plKRW += toKRW(plNative) || 0; costForPLKRW += toKRW(avg * qty) || 0; }
    if (todayNative != null) todayKRW += toKRW(todayNative) || 0;

    const name = (ok && q.name) || h.label || h.symbol;
    return { ...h, name, qty, avg, ok, cur, isUSD, price, value, plNative, plPct, today: todayNative, valueKRW, change: ok ? q.change : null };
  });

  rows.forEach((r) => { r.weight = r.valueKRW != null && totalValueKRW > 0 ? (r.valueKRW / totalValueKRW) * 100 : null; });
  rows.sort((a, b) => (b.valueKRW || 0) - (a.valueKRW || 0));

  const totalPLpct = costForPLKRW > 0 ? (plKRW / costForPLKRW) * 100 : null;
  const top = rows.find((r) => r.weight != null);
  const warn = top && top.weight > 40
    ? `‘${top.name}’ 한 종목이 전체의 ${top.weight.toFixed(0)}%예요. 특정 종목 비중이 높으면 위험도 커집니다 — 분산을 고려해 보세요.`
    : null;

  return {
    rows, totalValueKRW, totalPLKRW: plKRW, totalPLpct, todayKRW,
    valUS, valKR, hasUnknownFx, warn,
    hasCost: costForPLKRW > 0,
  };
}

const emptyHolding = () => ({ symbol: "", qty: "", avg: "" });

function PortfolioModal({ holdings, onSave, onClose }) {
  const [rows, setRows] = useState(
    holdings.length ? holdings.map((h) => ({ symbol: h.symbol, qty: String(h.qty ?? ""), avg: h.avg != null ? String(h.avg) : "" })) : [emptyHolding()]
  );
  useEscClose(onClose);

  const update = (i, key, val) => setRows((p) => p.map((r, j) => (j === i ? { ...r, [key]: val } : r)));
  const addRow = () => setRows((p) => [...p, emptyHolding()]);
  const delRow = (i) => setRows((p) => p.filter((_, j) => j !== i));

  const save = () => {
    const clean = rows
      .map((r) => ({ symbol: r.symbol.trim().toUpperCase().replace("KRW=X", "KRW=X"), qty: Number(r.qty), avg: r.avg === "" ? null : Number(r.avg), label: "" }))
      .filter((r) => r.symbol && r.qty > 0);
    onSave(clean);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">💼 보유종목 편집</div>
          <button className="modal-close" onClick={onClose}>✕ 닫기</button>
        </div>
        <div className="modal-body">
          <div className="search-hint" style={{ marginTop: 0 }}>
            종목코드·수량·평단가를 입력하세요. 코드 예: <b>AAPL</b>(애플), <b>005930.KS</b>(삼성전자), <b>035720.KS</b>(카카오).
            평단가는 비워도 되지만, 넣으면 손익까지 계산해요. 미국주는 달러, 한국주는 원 기준.
            <br />종목코드를 모르면 위 ‘＋ 종목 추가/검색’에서 검색해 확인하세요.
          </div>
          <div className="pf-edit-row pf-edit-head">
            <span>종목코드</span><span>수량(주)</span><span>평단가</span><span></span>
          </div>
          {rows.map((r, i) => (
            <div className="pf-edit-row" key={i}>
              <input className="pf-input" placeholder="AAPL / 005930.KS" value={r.symbol} onChange={(e) => update(i, "symbol", e.target.value)} />
              <input className="pf-input" placeholder="10" inputMode="decimal" value={r.qty} onChange={(e) => update(i, "qty", e.target.value)} />
              <input className="pf-input" placeholder="평단(선택)" inputMode="decimal" value={r.avg} onChange={(e) => update(i, "avg", e.target.value)} />
              <button className="pf-row-del" onClick={() => delRow(i)} title="행 삭제">✕</button>
            </div>
          ))}
          <button className="pf-add-row" onClick={addRow}>＋ 행 추가</button>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="add-btn" style={{ flex: 1, padding: "9px" }} onClick={save}>저장</button>
            <button className="modal-close" style={{ flex: 1 }} onClick={onClose}>취소</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 페이지 ---------- */
export default function Page() {
  const [watch, setWatch] = useState(null);
  const [quotes, setQuotes] = useState({});
  const [fetchedAt, setFetchedAt] = useState(null);
  const [status, setStatus] = useState("loading");
  const [selected, setSelected] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showPf, setShowPf] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  const [movers, setMovers] = useState(null);
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

  // 포트폴리오 로드/저장
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PF_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      setPortfolio(Array.isArray(arr) ? arr : []);
    } catch { setPortfolio([]); }
  }, []);
  useEffect(() => {
    if (portfolio == null) return;
    try { localStorage.setItem(PF_KEY, JSON.stringify(portfolio)); } catch {}
  }, [portfolio]);

  const allSymbols = useMemo(() => {
    const fixed = FIXED.map((f) => f.symbol);
    const w = (watch || []).map((s) => s.symbol);
    const p = (portfolio || []).map((s) => s.symbol);
    return [...new Set([...fixed, ...w, ...p])];
  }, [watch, portfolio]);

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

  // 거래량 상위(중립 데이터) — 1분마다 갱신
  useEffect(() => {
    let alive = true;
    const fetchMovers = () =>
      fetch("/api/movers", { cache: "no-store" })
        .then((r) => r.json())
        .then((j) => { if (alive && j.ok) setMovers(j.movers); })
        .catch(() => {});
    fetchMovers();
    const id = setInterval(fetchMovers, 60000);
    return () => { alive = false; clearInterval(id); };
  }, []);

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

  const savePortfolio = useCallback((list) => setPortfolio(list), []);

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

  const usdkrw = fxOk ? fxQuote.price : null;
  const pf = (portfolio && portfolio.length)
    ? computePortfolio(portfolio, quotes, usdkrw)
    : null;
  const pfTrend = (v) => (v == null ? "flat" : v > 0 ? "up" : v < 0 ? "down" : "flat");

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
            <button className="guide-btn" onClick={() => setShowGuide(true)}>📖 가이드</button>
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

      {/* 보유 포트폴리오 분석 */}
      <section>
        <div className="section-row">
          <div className="section-title">💼 내 보유 포트폴리오</div>
          <button className="add-btn" onClick={() => setShowPf(true)}>✎ 보유종목 편집</button>
        </div>

        {(!portfolio || portfolio.length === 0) ? (
          <div className="pf-empty">
            보유 중인 종목을 넣으면 <b>평가금액·손익·비중·국가 배분</b>을 실시간으로 분석해 드려요.<br />
            <button className="add-btn" style={{ marginTop: 10 }} onClick={() => setShowPf(true)}>＋ 보유종목 추가하기</button>
            <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--dim)" }}>
              종목코드는 위 ‘관심 종목’의 ‘＋ 종목 추가/검색’에서 확인할 수 있어요. 입력한 보유 정보는 이 브라우저에만 저장됩니다.
            </div>
          </div>
        ) : pf ? (
          <>
            <div className="pf-summary">
              <div className="pf-sum-card">
                <div className="pf-sum-k">총 평가금액 (원화환산)</div>
                <div className="pf-sum-v">{fmtKRW(pf.totalValueKRW)}</div>
              </div>
              <div className="pf-sum-card">
                <div className="pf-sum-k">총 평가손익{pf.hasCost ? "" : " (평단가 입력 시)"}</div>
                <div className={`pf-sum-v ${pfTrend(pf.totalPLKRW)}-text`}>{pf.hasCost ? fmtKRWsigned(pf.totalPLKRW) : "—"}</div>
                {pf.hasCost && pf.totalPLpct != null && (
                  <div className={`pf-sum-sub ${pfTrend(pf.totalPLpct)}-text`}>{fmtPct(pf.totalPLpct)}</div>
                )}
              </div>
              <div className="pf-sum-card">
                <div className="pf-sum-k">오늘 평가손익</div>
                <div className={`pf-sum-v ${pfTrend(pf.todayKRW)}-text`}>{fmtKRWsigned(pf.todayKRW)}</div>
              </div>
            </div>

            {pf.totalValueKRW > 0 && (
              <div className="pf-alloc">
                <div className="pf-alloc-bar">
                  <div className="pf-alloc-us" style={{ width: `${(pf.valUS / pf.totalValueKRW) * 100}%` }} />
                  <div className="pf-alloc-kr" style={{ width: `${(pf.valKR / pf.totalValueKRW) * 100}%` }} />
                </div>
                <div className="pf-alloc-legend">
                  <span>🇺🇸 미국 {((pf.valUS / pf.totalValueKRW) * 100).toFixed(0)}% ({fmtKRW(pf.valUS)})</span>
                  <span>🇰🇷 한국 {((pf.valKR / pf.totalValueKRW) * 100).toFixed(0)}% ({fmtKRW(pf.valKR)})</span>
                </div>
              </div>
            )}

            {pf.warn && <div className="pf-warn">⚠ {pf.warn}</div>}

            <div className="pf-board">
              {pf.rows.map((r) => (
                <div
                  key={r.symbol}
                  className={`pf-card ${r.ok ? pfTrend(r.plPct != null ? r.plPct : r.change) : "nodata"}`}
                  onClick={() => r.ok && setSelected({ symbol: r.symbol, label: r.name })}
                >
                  <div className="pf-top">
                    <span className="pf-name">{r.name}</span>
                    <span className="pf-weight">{r.weight != null ? `비중 ${r.weight.toFixed(1)}%` : ""}</span>
                  </div>
                  {!r.ok ? (
                    <div className="nodata-text">데이터 없음</div>
                  ) : (
                    <>
                      <div className="pf-value">
                        {r.isUSD ? `$${fmtPrice(r.value, "USD")}` : fmtKRW(r.value)}
                        {r.isUSD && r.valueKRW != null && <span className="pf-krw"> ≈ {fmtKRW(r.valueKRW)}</span>}
                      </div>
                      <div className="pf-pl">
                        {r.plNative != null ? (
                          <>
                            <span className={`${pfTrend(r.plPct)}-text`}>
                              {r.isUSD ? `${r.plNative > 0 ? "+" : ""}$${fmtPrice(Math.abs(r.plNative), "USD").replace("-", "")}` : fmtKRWsigned(r.plNative)}
                            </span>
                            <span className={`${pfTrend(r.plPct)}-text`}>{fmtPct(r.plPct)}</span>
                          </>
                        ) : (
                          <span style={{ color: "var(--dim)" }}>평단가 입력 시 손익 표시</span>
                        )}
                      </div>
                      <div className="pf-detail">
                        {r.qty.toLocaleString("ko-KR")}주 · 평단 {r.avg != null ? fmtPrice(r.avg, r.cur) : "—"} · 현재 {fmtPrice(r.price, r.cur)}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="disclaimer">
              ⚠ 입력하신 보유 정보와 실시간 시세로 계산한 참고용 분석이며, 매매 추천이 아닙니다. 환율·시세 지연으로 실제와 차이가 있을 수 있어요.
            </div>
          </>
        ) : null}
      </section>

      {/* 중립 데이터: 오늘 미국 거래량 상위 (추천 아님) */}
      {movers && movers.length > 0 && (
        <section>
          <div className="section-title">🔥 오늘 미국 거래량 상위</div>
          <div className="neutral-note">
            ‘많이 거래된 종목’이라는 사실 정보일 뿐, 매수 추천이 아니에요. 종목을 둘러볼 때 참고용으로만 보세요. (클릭 → 차트·요약)
          </div>
          <div className="movers-board">
            {movers.map((m) => {
              const cls = m.changePct == null ? "flat" : m.changePct > 0 ? "up" : m.changePct < 0 ? "down" : "flat";
              return (
                <div
                  key={m.symbol}
                  className="mover"
                  onClick={() => setSelected({ symbol: m.symbol, label: m.name })}
                  title={`${m.name} · 차트 보기`}
                >
                  <div className="mover-l">
                    <span className="mover-sym">{m.symbol}</span>
                    <span className="mover-name">{m.name}</span>
                  </div>
                  <div className="mover-r">
                    <div>{fmtPrice(m.price, m.currency)}</div>
                    <div className={`${cls}-text`}>{fmtPct(m.changePct)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="foot">
        데이터: Yahoo Finance 공개 엔드포인트 (무료 · API 키 없음) · 미국/한국 주식·지수, 원·달러(KRW=X).
        <br />
        30초마다 자동 갱신 · 상승=빨강, 하락=파랑 · 카드를 클릭하면 가격 추이 차트와 동향 요약 ·
        관심 종목·즐겨찾기는 이 브라우저에 저장 · 📖 가이드에서 용어와 초보 꿀팁을 볼 수 있어요.
      </div>

      {selected && <DetailModal item={selected} onClose={() => setSelected(null)} />}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} onAdd={addItem} existing={existingSymbols} />}
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
      {showPf && <PortfolioModal holdings={portfolio || []} onSave={savePortfolio} onClose={() => setShowPf(false)} />}

      {tip && (
        <div className="hover-tip" style={{ left: tip.x + 14, top: tip.y + 16 }}>{tip.text}</div>
      )}
    </div>
  );
}
