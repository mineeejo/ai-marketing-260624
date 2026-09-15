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
    <article style={{ maxWidth: 420, margin: "0 auto" }}>
      <h1 className="section-title" style={{ textAlign: "center" }}>
        관리자 로그인
      </h1>

      {me?.loggedIn ? (
        <div className="contact-card" style={{ textAlign: "center", marginTop: 20 }}>
          <div className="ico">✅</div>
          <h3 style={{ marginTop: 10 }}>
            <b>{me.username}</b> 님으로 로그인됨
          </h3>
          <p className="section-sub" style={{ fontSize: 14, marginTop: 10 }}>
            이제 <Link href="/reviews" style={{ color: "var(--accent-dark)", fontWeight: 700 }}>고객 후기</Link>에서
            모든 글을 비밀번호 없이 수정·삭제하고, 답글을 달 수 있어요.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
            <Link href="/reviews" className="btn">후기 관리하러 가기</Link>
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </div>
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
