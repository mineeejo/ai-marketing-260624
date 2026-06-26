export const metadata = {
  title: "연락처 | 조이감성투어",
  description: "그랜드캐년 투어 예약·할인 문의는 카카오톡으로. 라스베가스 호텔 픽업 안내.",
};

export default function ContactPage() {
  return (
    <article>
      <h1 className="section-title">연락처 · 예약 문의</h1>
      <p className="section-sub">
        그랜드캐년 투어 예약과 할인 문의는 카카오톡으로 편하게 연락주세요.
      </p>

      <div className="contact-grid">
        <div className="contact-card">
          <div className="ico">💬</div>
          <h3>카카오톡 문의</h3>
          <p>
            ID: <strong>2050hj</strong>
          </p>
          <p>할인·예약 실시간 상담</p>
        </div>
        <div className="contact-card">
          <div className="ico">🚐</div>
          <h3>픽업 안내</h3>
          <p>라스베가스 스트립 내 호텔</p>
          <p>예약 시 호텔명·주소 전달</p>
        </div>
        <div className="contact-card">
          <div className="ico">🕔</div>
          <h3>출발 시각</h3>
          <p>예약일 새벽(AM) 출발</p>
          <p>전날 밤~당일 새벽</p>
        </div>
        <div className="contact-card">
          <div className="ico">⭐</div>
          <h3>여행 후기</h3>
          <p>네이버 블로그 · 사이트 후기</p>
          <p>먼저 다녀온 분들의 생생한 리뷰</p>
        </div>
      </div>

      <h2 style={{ marginTop: 40, fontSize: 20 }}>예약 전 꼭 확인하세요</h2>
      <ul className="notes-list" style={{ marginTop: 12 }}>
        <li>픽업은 라스베가스 스트립 내 호텔에서만 가능합니다. (호텔명·주소 사전 전달 필요)</li>
        <li>캐리어는 차량에 실을 수 없어, 픽업 전 호텔 로비에 맡기셔야 합니다.</li>
        <li>공원·투어지 입장료는 현지 가격 변동 시 변동가가 적용됩니다.</li>
        <li>예약금 환불: 출발 6일 전 전액 / 5일~72시간 전 50% / 72시간 이내 불가 (천재지변 시 100% 환불).</li>
      </ul>
    </article>
  );
}
