"use client";

import { useEffect, useState } from "react";

// 관리자로 로그인한 동안, 모든 페이지 상단에 얇은 '관리자 모드' 띠를 표시.
export default function AdminBar() {
  const [me, setMe] = useState(null);

  async function load() {
    try {
      const r = await fetch("/api/admin/me", { cache: "no-store" });
      setMe(await r.json());
    } catch {
      setMe({ loggedIn: false });
    }
  }
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const on = Boolean(me?.loggedIn);
    try {
      document.body.classList.toggle("has-admin-bar", on);
    } catch {}
    return () => {
      try {
        document.body.classList.remove("has-admin-bar");
      } catch {}
    };
  }, [me]);

  if (!me?.loggedIn) return null;

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    try {
      window.location.reload();
    } catch {}
  }

  return (
    <div className="admin-bar">
      <span className="ab-label">🔒 관리자 모드{me.username ? ` · ${me.username}` : ""}</span>
      <button type="button" className="ab-logout" onClick={logout}>
        로그아웃
      </button>
    </div>
  );
}
