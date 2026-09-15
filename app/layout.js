import "./globals.css";

export const metadata = {
  title: "조이감성투어 | 라스베가스 출발 그랜드캐년 투어",
  description:
    "라스베가스 출발 그랜드캐년·엔텔롭캐년·홀슈밴드 당일/1박2일/2박3일 투어. 카카오톡 2050hj 문의.",
  openGraph: {
    title: "조이감성투어 — 그랜드캐년 투어",
    description: "라스베가스 출발 그랜드캐년 당일·1박2일·2박3일 투어",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
