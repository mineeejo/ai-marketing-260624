import Link from "next/link";
import SiteNav from "./SiteNav";

// 투어 상세·연락처·후기 페이지는 공통 헤더/푸터를 갖습니다.
// 메인 랜딩(/)은 이 레이아웃 밖에 있어 풀스크린으로 표시됩니다.
export default function SiteLayout({ children }) {
  return (
    <>
      <SiteNav />

      <main className="container main">{children}</main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <strong>조이감성투어</strong>
            <p>라스베가스 출발 그랜드캐년 여행 전문</p>
          </div>
          <div className="footer-meta">
            <p>💬 카카오톡 ID: 2050hj (할인·예약 문의)</p>
            <p>라스베가스 스트립 내 호텔 픽업</p>
            <p className="copyright">
              © {new Date().getFullYear()} 조이감성투어. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
