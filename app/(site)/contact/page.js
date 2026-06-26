export const metadata = {
  title: "연락처 | 여행기획 투어",
  description: "전화, 이메일, 카카오톡, 방문 상담 안내입니다. 편하게 문의주세요.",
};

export default function ContactPage() {
  return (
    <article>
      <h1 className="section-title">연락처 안내</h1>
      <p className="section-sub">
        궁금한 점이나 예약 문의는 아래 채널로 편하게 연락주세요. 평일 기준 1시간
        내 답변드립니다.
      </p>

      <div className="contact-grid">
        <div className="contact-card">
          <div className="ico">📞</div>
          <h3>전화 문의</h3>
          <p>02-1234-5678</p>
          <p>평일 09:00 – 18:00</p>
        </div>
        <div className="contact-card">
          <div className="ico">✉️</div>
          <h3>이메일</h3>
          <p>hello@tour.example</p>
          <p>24시간 접수</p>
        </div>
        <div className="contact-card">
          <div className="ico">💬</div>
          <h3>카카오톡 상담</h3>
          <p>@여행기획투어</p>
          <p>실시간 채팅 상담</p>
        </div>
        <div className="contact-card">
          <div className="ico">📍</div>
          <h3>방문 상담</h3>
          <p>서울특별시 중구 여행로 100</p>
          <p>여행빌딩 5층</p>
        </div>
      </div>

      <h2 style={{ marginTop: 40, fontSize: 20 }}>오시는 길</h2>
      <iframe
        className="map-box"
        title="오시는 길 지도"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src="https://www.openstreetmap.org/export/embed.html?bbox=126.9760%2C37.5630%2C126.9870%2C37.5690&layer=mapnik&marker=37.566%2C126.982"
      />
      <p className="section-sub" style={{ marginTop: 12 }}>
        지하철 2호선 시청역 4번 출구에서 도보 5분 거리입니다.
      </p>
    </article>
  );
}
