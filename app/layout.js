export const metadata = {
  title: "US MARKET TERMINAL",
  description: "미국 주식 실시간 대시보드 (무료 공개 API)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
