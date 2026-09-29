"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// 관리자로 로그인했을 때만 보이는 '상품 관리' 버튼.
export default function AdminToursButton() {
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    fetch("/api/admin/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAdmin(Boolean(d.loggedIn)))
      .catch(() => {});
  }, []);
  if (!admin) return null;
  return (
    <Link href="/admin/tours" className="lp-more admin-manage">
      🛠 상품 관리
    </Link>
  );
}
