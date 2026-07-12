import { KAKAO_ID } from "../../lib/site";

export const metadata = {
  title: "예약 · 문의 | 조이감성투어",
  description: "그랜드캐년 투어 예약·할인 문의는 카카오톡으로. Kakao ID : 2050hj",
};

export default function BookPage() {
  return (
    <article style={{ textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
      <h1 className="section-title">예약 · 문의</h1>
      <p className="section-sub">
        그랜드캐년 투어 예약과 할인 문의는 카카오톡으로 편하게 연락주세요.
      </p>

      <div className="contact-card" style={{ marginTop: 24 }}>
        <div className="ico">💬</div>
        <h3 style={{ marginTop: 12 }}>카카오톡 문의 / 예약</h3>
        <p style={{ fontSize: 20, marginTop: 10 }}>
          조이감성투어 Kakao ID : <strong>{KAKAO_ID}</strong>
        </p>
        <p className="section-sub" style={{ marginTop: 10, fontSize: 14 }}>
          카카오톡에서 위 ID로 검색해 문의·예약해주세요.
        </p>
      </div>

      <p className="section-sub" style={{ marginTop: 20, fontSize: 14 }}>
        단독투어도 가능합니다. 카톡 예약 시 투어비 할인 이벤트도 진행 중이에요!
      </p>
    </article>
  );
}
