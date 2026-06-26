"use client";

import { useState } from "react";
import Link from "next/link";
import { Twitter, Circle, Instagram, Linkedin } from "lucide-react";
import { tours, formatPrice } from "./lib/tours";

// 배경 영상 (Higgsfield로 생성한 그랜드캐년 골든아워 항공 영상)
const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3CkUAX5vl7hsRPpzsmLNJVSyYqp/hf_20260626_041746_4ec96dc5-b701-4029-9e9f-adc136e500a5.mp4";

// 그랜드캐년 투어 옵션 (문의 폼의 관심 태그)
const SERVICES = [
  "Day Tour",
  "2 Days 1 Night",
  "3 Days 2 Nights",
  "Skywalk",
  "Antelope Canyon",
  "Horseshoe Bend",
  "Zion Canyon",
  "Other",
];

// "왜 조이감성투어" 3가지 이유
const WHY = [
  {
    icon: "🚐",
    title: "편안한 감성 여행",
    desc: "쾌적하고 안락한 최신 차량으로 이동. 장시간 이동도 창밖 풍경을 즐기며 힐링하는 시간으로 채워드려요.",
  },
  {
    icon: "🎙️",
    title: "베테랑 가이드의 스토리텔링",
    desc: "단순한 설명이 아니라 그랜드캐년에 얽힌 역사와 숨은 이야기까지. 마치 한 편의 영화처럼 빠져들게 됩니다.",
  },
  {
    icon: "📸",
    title: "알찬 코스 · 인생샷 명당",
    desc: "오랜 경험과 노하우로 핵심만 콕콕. 현지 가이드만 아는 '인생샷 명당'까지 꼼꼼하게 안내해드려요.",
  },
];

function SocialBtn({ icon: Icon, className }) {
  return (
    <button
      type="button"
      className={`w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity ${className}`}
    >
      <Icon size={13} />
    </button>
  );
}

export default function LandingPage() {
  const [selected, setSelected] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function toggleService(s) {
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
  }

  const inputClass =
    "flex-1 min-w-0 text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-transparent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition";

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
        {/* Scrim: keeps white headline readable while video loads / if autoplay is blocked */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-[calc(100vh-24px)] sm:min-h-[calc(100vh-32px)] md:min-h-[calc(100vh-48px)] lg:h-full p-4 sm:p-6 md:p-8 gap-6">
          {/* Navbar */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm pl-3 sm:pl-4 pr-2 py-2 w-full sm:w-auto flex items-center gap-3 sm:gap-6">
            <Link href="/" className="flex items-center shrink-0">
              <svg width="32" height="32" viewBox="0 0 256 256" aria-label="로고">
                <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z" fill="#000" />
                <path d="M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="#000" />
              </svg>
            </Link>
            <nav className="hidden sm:flex items-center gap-6">
              <Link
                href="/tours"
                className="text-gray-800 text-sm font-medium hover:opacity-60 transition-opacity whitespace-nowrap"
              >
                Tours
              </Link>
              <Link
                href="/tours"
                className="text-gray-800 text-sm font-medium hover:opacity-60 transition-opacity whitespace-nowrap"
              >
                Experiences
              </Link>
              <Link
                href="/reviews"
                className="text-gray-800 text-sm font-medium hover:opacity-60 transition-opacity whitespace-nowrap"
              >
                Reviews
              </Link>
              <Link
                href="/contact"
                className="text-gray-800 text-sm font-medium hover:opacity-60 transition-opacity whitespace-nowrap"
              >
                Contact
              </Link>
            </nav>
            <Link
              href="/contact"
              className="ml-auto bg-black text-white text-sm font-medium px-4 sm:px-5 py-2 rounded-xl hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              Book a tour
            </Link>
          </div>

          {/* Spacer */}
          <div className="flex-1 min-h-[2rem]" />

          {/* Bottom row */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Headline */}
            <p className="text-white text-3xl sm:text-4xl xl:text-5xl font-medium leading-tight drop-shadow-lg lg:max-w-lg xl:max-w-2xl shrink-0">
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
              </span>
            </p>

            {/* Contact form */}
            <div className="w-full lg:w-[min(480px,45%)] shrink-0">
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden p-4 sm:p-6 flex flex-col gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-black tracking-tight">
                  Say hello! 👋
                </h2>

                {/* Email + socials */}
                <div className="flex flex-row items-center justify-between gap-3 bg-gray-50 rounded-2xl px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Drop us a line</p>
                    <a
                      href="mailto:hello@grandcanyon.tour"
                      className="block text-blue-600 font-semibold hover:underline truncate"
                    >
                      hello@grandcanyon.tour
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <SocialBtn icon={Twitter} className="bg-gray-100 text-gray-800" />
                    <SocialBtn icon={Circle} className="bg-pink-100 text-pink-500" />
                    <SocialBtn icon={Instagram} className="bg-orange-100 text-orange-400" />
                    <SocialBtn icon={Linkedin} className="bg-blue-100 text-blue-600" />
                  </div>
                </div>

                {sent ? (
                  <div className="flex flex-col items-center text-center py-6 gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-xl">
                      ✓
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">You're all set!</h3>
                    <p className="text-sm text-gray-500">Expect a reply within 24 hours.</p>
                  </div>
                ) : (
                  <>
                    {/* OR divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-gray-400 font-medium text-sm">OR</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                      <label className="text-sm font-medium text-black">
                        Tell us about your trip
                      </label>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          className={inputClass}
                          placeholder="Full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                        <input
                          className={inputClass}
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <textarea
                        rows={4}
                        className={`${inputClass} resize-none`}
                        placeholder="When are you planning to visit, and how many travelers..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-black">
                          I'm interested in...
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {SERVICES.map((s) => {
                            const active = selected.includes(s);
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => toggleService(s)}
                                className={`text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
                                  active
                                    ? "bg-gray-100 text-black border-black"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                                }`}
                              >
                                {s}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={sending}
                        className="w-full bg-black text-white text-sm font-semibold py-3 rounded-2xl hover:bg-gray-800 transition-colors disabled:opacity-60"
                      >
                        {sending ? "Sending..." : "Send my message"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* ===== 투어 상품 섹션 ===== */}
      <section id="tours" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-emerald-700 tracking-widest">
            JOY GAMSUNG TOUR
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-2">
            그랜드캐년 투어 상품
          </h2>
          <p className="text-gray-500 mt-3">라스베가스 출발 · 당일부터 2박 3일까지</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((t) => (
            <Link
              key={t.id}
              href={`/tours/${t.id}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow overflow-hidden flex flex-col"
            >
              <div className="h-48 bg-emerald-50 overflow-hidden">
                {t.image ? (
                  <img
                    src={t.image}
                    alt={t.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    {t.emoji}
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <span className="self-start text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  {t.badge}
                </span>
                <h3 className="text-lg font-bold mt-3">{t.title}</h3>
                <p className="text-sm text-gray-500 mt-1 flex-1">{t.summary}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-emerald-700 font-extrabold text-lg">
                    {formatPrice(t.price, t.currency)}
                  </span>
                  <span className="text-sm text-gray-400">{t.duration}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/tours"
            className="inline-block border border-gray-300 rounded-full px-6 py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            전체 상품 자세히 보기 →
          </Link>
        </div>
      </section>

      {/* ===== 왜 조이감성투어 ===== */}
      <section className="bg-stone-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              왜 조이감성투어일까요?
            </h2>
            <p className="text-gray-500 mt-3">
              편안함, 감동, 그리고 인생샷까지 — 다녀온 분들이 추천하는 이유
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {WHY.map((w) => (
              <div
                key={w.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="text-4xl">{w.icon}</div>
                <h3 className="text-lg font-bold mt-4">{w.title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-[#0e1422] text-gray-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col sm:flex-row justify-between gap-6">
          <div>
            <p className="text-white font-bold text-lg">🏜️ 조이감성투어</p>
            <p className="text-sm mt-1">라스베가스 출발 그랜드캐년 여행 전문</p>
          </div>
          <div className="sm:text-right text-sm space-y-1">
            <p>
              💬 카카오톡 ID:{" "}
              <span className="text-white font-semibold">2050hj</span> (할인·예약 문의)
            </p>
            <p>라스베가스 스트립 내 호텔 픽업</p>
            <div className="flex sm:justify-end gap-4 mt-3">
              <Link href="/tours" className="hover:text-white transition-colors">
                투어 상품
              </Link>
              <Link href="/reviews" className="hover:text-white transition-colors">
                여행 후기
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                연락처
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
