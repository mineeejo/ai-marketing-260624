import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import AdminBar from "./AdminBar";

const OG_IMAGE =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3CkUAX5vl7hsRPpzsmLNJVSyYqp/hf_20260626_053223_23dff708-92fa-4a83-a907-239321237c24.png";

export const metadata = {
  metadataBase: new URL("https://joygamsungtour.vercel.app"),
  title: "조이감성투어 | 라스베가스 출발 그랜드캐년 투어",
  description:
    "라스베가스 출발 그랜드캐년·엔텔롭캐년·홀슈밴드 당일·1박2일 투어. 카카오톡 2050hj 문의.",
  openGraph: {
    title: "조이감성투어 — 라스베가스 그랜드캐년 투어",
    description: "라스베가스 출발 그랜드캐년 당일·1박2일 투어 · 카톡 예약 시 할인 · 카톡 2050hj",
    type: "website",
    url: "https://joygamsungtour.vercel.app",
    siteName: "조이감성투어",
    locale: "ko_KR",
    images: [{ url: OG_IMAGE, width: 1024, height: 1024, alt: "그랜드캐년 조이감성투어" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "조이감성투어 — 라스베가스 그랜드캐년 투어",
    description: "라스베가스 출발 그랜드캐년 당일·1박2일 투어 · 카톡 2050hj",
    images: [OG_IMAGE],
  },
};

// 구글 검색결과에 '여행사' 정보로 인식되도록 하는 구조화 데이터(JSON-LD).
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "조이감성투어",
  alternateName: "Joy Gamsung Tour",
  url: "https://joygamsungtour.vercel.app",
  image: OG_IMAGE,
  description:
    "라스베가스 출발 그랜드캐년·엔텔롭캐년·홀슈밴드 당일·1박2일 한인 투어. 카카오톡 2050hj 예약·문의.",
  areaServed: "Las Vegas, Grand Canyon, USA",
  knowsLanguage: ["ko", "en"],
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "reservations",
    availableLanguage: "Korean",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <AdminBar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
