"use client";

import { useState } from "react";
import Link from "next/link";
import { Twitter, Circle, Instagram, Linkedin } from "lucide-react";

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
    <div className="min-h-screen bg-white p-3 sm:p-4 md:p-6">
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
  );
}
