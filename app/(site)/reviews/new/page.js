import Link from "next/link";
import ReviewForm from "../ReviewForm";

export const metadata = {
  title: "리뷰 쓰기 | 조이감성투어",
  description: "여행 후기를 남겨보세요. 비밀번호(숫자 4자리)로 나중에 수정·삭제할 수 있습니다.",
};

export default function NewReviewPage() {
  return (
    <>
      <p className="section-sub" style={{ marginBottom: 8 }}>
        <Link href="/reviews" style={{ color: "var(--accent-dark)", fontWeight: 600 }}>
          ← 후기 목록으로
        </Link>
      </p>
      <h1 className="section-title">리뷰 쓰기</h1>
      <p className="section-sub">
        비밀번호(숫자 4자리)는 나중에 본인 리뷰를 수정·삭제할 때 사용됩니다.
      </p>

      <ReviewForm />
    </>
  );
}
