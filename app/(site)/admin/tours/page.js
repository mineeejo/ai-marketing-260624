"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// 배열 ↔ 텍스트(줄바꿈) 변환 헬퍼
const toLines = (arr) => (Array.isArray(arr) ? arr.join("\n") : "");
const fromLines = (str) =>
  String(str || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
const itinToText = (itin) =>
  (Array.isArray(itin) ? itin : [])
    .map((d) => `${d.day} :: ${d.desc}`)
    .join("\n");
const textToItin = (str) =>
  fromLines(str)
    .map((line) => {
      const i = line.indexOf("::");
      if (i === -1) return { day: "", desc: line.trim() };
      return { day: line.slice(0, i).trim(), desc: line.slice(i + 2).trim() };
    })
    .filter((d) => d.day || d.desc);
const numOrNull = (v) => (v === "" || v == null ? null : Number(v));

export default function AdminToursPage() {
  const [me, setMe] = useState(null);
  const [tours, setTours] = useState([]);
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [meRes, tRes] = await Promise.all([
        fetch("/api/admin/me", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/tours", { cache: "no-store" }).then((r) => r.json()),
      ]);
      setMe(meRes);
      setTours(tRes.tours || []);
      setSource(tRes.source);
    } catch {
      setMsg({ type: "error", text: "불러오기에 실패했습니다." });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadAll();
  }, []);

  async function handleSeed() {
    setMsg(null);
    const res = await fetch("/api/tours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seed: true }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg({ type: "error", text: data.error });
    setMsg({ type: "success", text: "기본 상품을 불러왔어요. 이제 편집할 수 있습니다." });
    loadAll();
  }

  async function handleAdd() {
    const id = window.prompt("새 상품 ID (영문 소문자·숫자·하이픈, 예: winter-special)");
    if (!id) return;
    setMsg(null);
    const res = await fetch("/api/tours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: id.trim(),
        sort: tours.length,
        data: { title: "새 상품", badge: "NEW", region: "라스베가스 출발", duration: "미정", comingSoon: true, summary: "" },
      }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg({ type: "error", text: data.error });
    loadAll();
  }

  if (loading) return <p className="empty">불러오는 중...</p>;

  if (!me?.loggedIn) {
    return (
      <article style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <h1 className="section-title">상품 관리</h1>
        <p className="section-sub">관리자 로그인이 필요합니다.</p>
        <Link href="/admin" className="btn">관리자 로그인하러 가기</Link>
      </article>
    );
  }

  return (
    <article>
      <h1 className="section-title">상품 관리</h1>
      <p className="section-sub">
        로그인: <b>{me.username}</b> · 여기서 수정하면 <Link href="/tours" style={{ color: "var(--accent-dark)", fontWeight: 700 }}>투어 상품</Link> 페이지에 바로 반영됩니다.
      </p>

      {msg && <p className={`form-msg ${msg.type}`}>{msg.text}</p>}

      {source === "default" ? (
        <div className="contact-card" style={{ textAlign: "center" }}>
          <p style={{ marginBottom: 12 }}>
            아직 DB에 상품이 없어 <b>코드 기본값</b>을 보여주고 있어요.<br />
            아래 버튼으로 현재 상품을 DB로 불러오면 편집을 시작할 수 있습니다.
          </p>
          <button className="btn" onClick={handleSeed}>현재 상품 불러와서 편집 시작</button>
        </div>
      ) : (
        <>
          <div style={{ margin: "8px 0 20px" }}>
            <button className="btn btn-ghost" onClick={handleAdd}>＋ 새 상품 추가</button>
          </div>
          {tours.map((t) => (
            <TourEditor key={t.id} tour={t} onChanged={loadAll} setMsg={setMsg} />
          ))}
        </>
      )}
    </article>
  );
}

function TourEditor({ tour, onChanged, setMsg }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState(() => ({
    comingSoon: !!tour.comingSoon,
    emoji: tour.emoji || "",
    image: tour.image || "",
    badge: tour.badge || "",
    title: tour.title || "",
    region: tour.region || "",
    duration: tour.duration || "",
    price: tour.price ?? "",
    priceKakao: tour.priceKakao ?? "",
    kakaoDiscount: tour.kakaoDiscount ?? "",
    priceNote: tour.priceNote || "",
    summary: tour.summary || "",
    highlights: toLines(tour.highlights),
    itinerary: itinToText(tour.itinerary),
    included: toLines(tour.included),
    notIncluded: toLines(tour.notIncluded),
    breakdown: toLines(tour.breakdown),
    notes: toLines(tour.notes),
    sort: tour.sort ?? 0,
  }));

  const set = (k) => (e) =>
    setF((prev) => ({ ...prev, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const data = {
        emoji: f.emoji || undefined,
        image: f.image || undefined,
        badge: f.badge,
        title: f.title,
        region: f.region,
        duration: f.duration,
        currency: "USD",
        comingSoon: f.comingSoon,
        summary: f.summary,
      };
      if (!f.comingSoon) {
        data.price = numOrNull(f.price);
        data.priceKakao = numOrNull(f.priceKakao);
        data.kakaoDiscount = numOrNull(f.kakaoDiscount);
        data.priceNote = f.priceNote;
        data.highlights = fromLines(f.highlights);
        data.itinerary = textToItin(f.itinerary);
        data.included = fromLines(f.included);
        data.notIncluded = fromLines(f.notIncluded);
        data.breakdown = fromLines(f.breakdown);
        data.notes = fromLines(f.notes);
      }
      const res = await fetch(`/api/tours/${tour.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, sort: Number(f.sort) }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error);
      setMsg({ type: "success", text: `'${f.title}' 저장 완료 ✅` });
      onChanged();
    } catch (e) {
      setMsg({ type: "error", text: e.message || "저장 실패" });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`'${tour.title}' 상품을 삭제할까요?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/tours/${tour.id}`, { method: "DELETE" });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error);
      setMsg({ type: "success", text: "삭제되었습니다." });
      onChanged();
    } catch (e) {
      setMsg({ type: "error", text: e.message || "삭제 실패" });
      setBusy(false);
    }
  }

  return (
    <div className="review-form" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setOpen((v) => !v)}>
        <strong>
          {f.comingSoon ? "🔒 " : ""}{f.title || tour.id}
          <span style={{ color: "var(--muted)", fontWeight: 400 }}> · {tour.id}</span>
        </strong>
        <span className="link-btn">{open ? "접기 ▲" : "펼쳐서 편집 ▼"}</span>
      </div>

      {open && (
        <div style={{ marginTop: 16 }}>
          <label className="field" style={{ display: "block" }}>
            <input type="checkbox" checked={f.comingSoon} onChange={set("comingSoon")} /> 곧 공개(티저) 상품으로 표시
          </label>

          <div className="field-row">
            <div className="field"><label>뱃지</label><input value={f.badge} onChange={set("badge")} placeholder="당일 / 1박 2일 / COMING SOON" /></div>
            <div className="field"><label>이모지(사진 없을 때)</label><input value={f.emoji} onChange={set("emoji")} placeholder="🌄" /></div>
          </div>
          <div className="field"><label>상품명</label><input value={f.title} onChange={set("title")} /></div>
          <div className="field-row">
            <div className="field"><label>지역</label><input value={f.region} onChange={set("region")} /></div>
            <div className="field"><label>기간</label><input value={f.duration} onChange={set("duration")} /></div>
          </div>
          <div className="field"><label>대표 이미지 URL</label><input value={f.image} onChange={set("image")} placeholder="https://..." /></div>
          <div className="field"><label>요약 설명</label><textarea value={f.summary} onChange={set("summary")} /></div>

          {!f.comingSoon && (
            <>
              <div className="field-row">
                <div className="field"><label>정가($)</label><input type="number" value={f.price} onChange={set("price")} /></div>
                <div className="field"><label>카톡가($)</label><input type="number" value={f.priceKakao} onChange={set("priceKakao")} /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>1인당 할인액($)</label><input type="number" value={f.kakaoDiscount} onChange={set("kakaoDiscount")} /></div>
                <div className="field"><label>가격 안내 문구</label><input value={f.priceNote} onChange={set("priceNote")} /></div>
              </div>
              <div className="field"><label>여행 하이라이트 (한 줄에 하나)</label><textarea value={f.highlights} onChange={set("highlights")} style={{ minHeight: 90 }} /></div>
              <div className="field"><label>상세 일정 (한 줄에 하나 · 형식: 라벨 :: 설명)</label><textarea value={f.itinerary} onChange={set("itinerary")} style={{ minHeight: 90 }} placeholder="DAY 1 :: 호텔 픽업 → ..." /></div>
              <div className="field"><label>포함 사항 (한 줄에 하나)</label><textarea value={f.included} onChange={set("included")} style={{ minHeight: 90 }} /></div>
              <div className="field"><label>불포함 사항 (한 줄에 하나)</label><textarea value={f.notIncluded} onChange={set("notIncluded")} style={{ minHeight: 90 }} /></div>
              <div className="field"><label>예상 총액 안내 (한 줄에 하나)</label><textarea value={f.breakdown} onChange={set("breakdown")} /></div>
              <div className="field"><label>예약 전 확인사항 (한 줄에 하나)</label><textarea value={f.notes} onChange={set("notes")} style={{ minHeight: 120 }} /></div>
            </>
          )}

          <div className="field" style={{ maxWidth: 160 }}><label>정렬 순서(작을수록 앞)</label><input type="number" value={f.sort} onChange={set("sort")} /></div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" onClick={save} disabled={busy}>{busy ? "저장 중..." : "저장"}</button>
            <button className="btn btn-ghost" onClick={remove} disabled={busy} style={{ color: "#c0563b", borderColor: "#e3b4a8" }}>삭제</button>
          </div>
        </div>
      )}
    </div>
  );
}
