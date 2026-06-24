import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "여행기획 투어 | 잊지 못할 여행을 만듭니다",
  description:
    "엄선한 국내·해외 투어 상품을 소개합니다. 일정, 가격, 후기를 확인하고 편하게 문의하세요.",
  openGraph: {
    title: "여행기획 투어",
    description: "엄선한 국내·해외 투어 상품과 생생한 여행 후기",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="brand">
              ✈️ 여행기획<span>투어</span>
            </Link>
            <nav className="nav">
              <Link href="/">투어 소개</Link>
              <Link href="/contact">연락처</Link>
              <Link href="/reviews">여행 후기</Link>
            </nav>
          </div>
        </header>

        <main className="container main">{children}</main>

        <footer className="site-footer">
          <div className="container footer-inner">
            <div>
              <strong>여행기획 투어</strong>
              <p>국내·해외 맞춤 여행 전문</p>
            </div>
            <div className="footer-meta">
              <p>📞 02-1234-5678 · ✉️ hello@tour.example</p>
              <p>서울특별시 중구 여행로 100 · 평일 09:00–18:00</p>
              <p className="copyright">
                © {new Date().getFullYear()} 여행기획 투어. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
