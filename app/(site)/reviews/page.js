import Link from "next/link";
import ReviewsList from "./ReviewsList";

export const metadata = {
  title: "여행 후기 | 조이감성투어",
  description: "먼저 다녀온 여행자들의 생생한 후기. 사진과 함께 남긴 리뷰를 확인하세요.",
};

export default function ReviewsPage() {
  return (
    <>
      <h1 className="section-title">여행 후기</h1>
      <p className="section-sub">조이감성투어와 함께한 여행자들의 생생한 후기입니다.</p>

      <ReviewsList />

      {/* 우측 하단 플로팅 "리뷰 쓰기" 버튼 */}
      <Link href="/reviews/new" className="fab">
        ✍️ 리뷰 쓰기
      </Link>
    </>
  );
}
