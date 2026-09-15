"use client";

import Link from "next/link";
import { useState } from "react";

// 공통 헤더 내비게이션. 데스크톱은 가로 메뉴, 모바일은 햄버거(☰) 토글.
const LINKS = [
  { href: "/tours", label: "투어 상품" },
  { href: "/why", label: "왜 조이감성투어인가요?" },
  { href: "/reviews", label: "고객 후기" },
  { href: "/book", label: "예약·문의" },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          🏜️ 조이감성<span>투어</span>
        </Link>

        <nav className="nav nav-desktop">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="nav-mobile">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
