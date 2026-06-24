import ReviewsClient from "./ReviewsClient";

export const metadata = {
  title: "여행 후기 | 여행기획 투어",
  description: "먼저 다녀온 여행자들의 생생한 후기. 사진과 함께 직접 후기를 남겨보세요.",
};

export default function ReviewsPage() {
  return (
    <>
      <h1 className="section-title">여행 후기</h1>
      <p className="section-sub">
        다녀오신 여행은 어떠셨나요? 사진과 함께 솔직한 후기를 남겨주세요.
      </p>
      <ReviewsClient />
    </>
  );
}
