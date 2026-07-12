import Link from "next/link";
import { KAKAO_ID } from "./lib/site";

// 배경 영상 (Higgsfield로 생성한 그랜드캐년 골든아워 항공 영상)
const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3CkUAX5vl7hsRPpzsmLNJVSyYqp/hf_20260626_041746_4ec96dc5-b701-4029-9e9f-adc136e500a5.mp4";

const NAV = [
  { href: "/tours", label: "Tours" },
  { href: "/why", label: "Why us" },
  { href: "/reviews", label: "Reviews" },
];

export default function LandingPage() {
  return (
    <div className="bg-white">
      <div className="p-3 sm:p-4 md:p-6">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-800 min-h-[calc(100vh-24px)] sm:min-h-[calc(100vh-32px)] md:min-h-[calc(100vh-48px)] lg:h-[calc(100vh-48px)]">
          {/* Background video */}
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            src={VIDEO_URL}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          {/* Content */}
          <div className="relative z-10 flex flex-col min-h-[calc(100vh-24px)] sm:min-h-[calc(100vh-32px)] md:min-h-[calc(100vh-48px)] lg:h-full p-4 sm:p-6 md:p-8 gap-6">
            {/* Navbar */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm pl-3 sm:pl-4 pr-2 py-2 w-full sm:w-auto flex items-center gap-3 sm:gap-6">
              <Link href="/" className="flex items-center shrink-0" aria-label="조이감성투어">
                <svg width="32" height="32" viewBox="0 0 256 256">
                  <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="#000" />
                  <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="#000" />
                </svg>
              </Link>
              <nav className="hidden sm:flex items-center gap-6">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="text-gray-800 text-sm font-medium hover:opacity-60 transition-opacity whitespace-nowrap"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
              <Link
                href="/book"
                className="ml-auto bg-black text-white text-sm font-medium px-4 sm:px-5 py-2 rounded-xl hover:bg-gray-800 transition-colors whitespace-nowrap"
              >
                Book a tour
              </Link>
            </div>

            {/* Spacer */}
            <div className="flex-1 min-h-[2rem]" />

            {/* Bottom row */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <p className="text-white text-3xl sm:text-4xl xl:text-5xl font-medium leading-tight drop-shadow-lg lg:max-w-xl shrink-0">
                Witness the wonder of the
                <br />
                <span
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontStyle: "italic",
                    fontWeight: 400,
                  }}
                >
                  Grand Canyon
                </span>{" "}
                with 조이감성투어
              </p>

              {/* KakaoTalk card (replaces the old contact form) */}
              <div className="w-full lg:w-[min(420px,42%)] shrink-0">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-7">
                  <p className="text-sm text-gray-500">💬 카카오톡 문의 / 예약</p>
                  <p className="text-2xl font-bold tracking-tight mt-1">조이감성투어</p>
                  <p className="text-lg font-semibold text-blue-600 mt-3">
                    Kakao ID : {KAKAO_ID}
                  </p>
                  <p className="text-sm text-gray-500 mt-3">
                    카카오톡에서 위 ID로 검색해 문의·예약해주세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer (연락처) */}
      <footer className="bg-[#0e1422] text-gray-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col sm:flex-row justify-between gap-6">
          <div>
            <p className="text-white font-bold text-lg">🏜️ 조이감성투어</p>
            <p className="text-sm mt-1">라스베가스 출발 그랜드캐년 여행 전문</p>
          </div>
          <div className="sm:text-right text-sm space-y-1">
            <p>
              💬 카카오톡 ID:{" "}
              <span className="text-white font-semibold">{KAKAO_ID}</span> (할인·예약 문의)
            </p>
            <p>라스베가스 스트립 내 호텔 픽업</p>
            <div className="flex sm:justify-end gap-4 mt-3">
              <Link href="/tours" className="hover:text-white transition-colors">투어 상품</Link>
              <Link href="/why" className="hover:text-white transition-colors">왜 조이감성투어</Link>
              <Link href="/reviews" className="hover:text-white transition-colors">여행 후기</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
