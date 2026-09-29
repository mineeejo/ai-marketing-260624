"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [me, setMe] = useState(null); // {loggedIn, username}
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function loadMe() {
    try {
      const res = await fetch("/api/admin/me", { cache: "no-store" });
      setMe(await res.json());
    } catch {
      setMe({ loggedIn: false });
    }
  }
  useEffect(() => {
    loadMe();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPassword("");
      await loadMe();
    } catch (e2) {
      setErr(e2.message || "로그인에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    await loadMe();
  }

  return (
    <article style={{ maxWidth: me?.loggedIn ? 620 : 420, margin: "0 auto" }}>
      <h1 className="section-title" style={{ textAlign: "center" }}>
        {me?.loggedIn ? "관리자 홈" : "관리자 로그인"}
      </h1>

      {me?.loggedIn ? (
        <>
          <p className="section-sub" style={{ textAlign: "center" }}>
            <b>{me.username}</b> 님, 안녕하세요! 아래에서 원하는 작업을 선택하세요.
          </p>

          <div className="admin-dash">
            <Link href="/admin/tours" className="admin-dash-card">
              <div className="ad-ico">🛠</div>
              <h3>상품 관리</h3>
              <p>투어 상품의 가격·설명·할인 문구를 브라우저에서 바로 수정해요.</p>
            </Link>
            <Link href="/reviews" className="admin-dash-card">
              <div className="ad-ico">💬</div>
              <h3>후기 관리</h3>
              <p>모든 후기를 비밀번호 없이 수정·삭제하고 답글을 달 수 있어요.</p>
            </Link>
            <Link href="/" className="admin-dash-card">
              <div className="ad-ico">🏠</div>
              <h3>홈페이지 보기</h3>
              <p>고객이 보는 실제 홈페이지 화면을 확인해요.</p>
            </Link>
            <a href="/reviews/new" className="admin-dash-card">
              <div className="ad-ico">✍️</div>
              <h3>후기 작성</h3>
              <p>새 고객 후기를 직접 남길 수 있어요.</p>
            </a>
          </div>

          <div style={{ textAlign: "center", marginTop: 22 }}>
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </>
      ) : (
        <form className="review-form" onSubmit={handleLogin} style={{ marginTop: 20 }}>
          {err && <p className="form-msg error">{err}</p>}
          <p className="section-sub" style={{ fontSize: 14 }}>
            관리자 전용 페이지입니다. 발급받은 아이디·비밀번호로 로그인하세요.
          </p>
          <div className="field">
            <label>아이디</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              placeholder="관리자 아이디"
            />
          </div>
          <div className="field">
            <label>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              placeholder="비밀번호"
            />
          </div>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "로그인 중..." : "로그인"}
          </button>
        </form>
      )}
    </article>
  );
}
