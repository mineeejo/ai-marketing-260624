import "./globals.css";

export const metadata = {
  title: "그랜드캐년 투어 | 잊지 못할 협곡의 여정",
  description:
    "그랜드캐년의 압도적인 절경을 가이드와 함께. 선라이즈·헬기·스카이워크 투어를 문의하세요.",
  openGraph: {
    title: "그랜드캐년 투어",
    description: "그랜드캐년의 압도적인 절경을 가이드와 함께",
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
