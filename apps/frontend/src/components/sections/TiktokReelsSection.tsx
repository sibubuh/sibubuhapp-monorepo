import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ImageType } from "../types/image";

const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;

interface TikTok {
  id: number;
  id_titkok: string;
  author: string;
  handle: string;
  caption: string;
  avatar?: ImageType | null;
  tag: string;
}

interface TiktokReelsSectionProps {
  videos: TikTok[];
  title?: string;
}

const embedSrc = (id: string, referrer: string) =>
  `https://www.tiktok.com/embed/v2/${id}?lang=en-US&referrer=${encodeURIComponent(referrer)}`;

function MusicNote() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
      <path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3H9z" />
    </svg>
  );
}

function TikTokCard({
  video,
  isActive,
  onClick,
}: {
  video: TikTok;
  isActive: boolean;
  onClick: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const iframeKey = useRef(0);

  useEffect(() => {
    if (isActive) {
      setLoaded(false);
      iframeKey.current += 1;
    }
  }, [isActive]);

  return (
    <div
      onClick={!isActive ? onClick : undefined}
      className={`
        relative flex-shrink-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        ${
          isActive
            ? "z-10 scale-100 opacity-100 cursor-default"
            : "scale-[0.82] opacity-40 hover:opacity-60 hover:scale-[0.85] cursor-pointer"
        }
      `}
      style={{ width: isActive ? 310 : 195 }}
    >
      {isActive && (
        <div
          className="absolute -inset-[3px] rounded-[30px] z-0 animate-pulse"
          style={{
            background: "linear-gradient(135deg,#69C9D0,#010101,#EE1D52)",
            filter: "blur(7px)",
            opacity: 0.9,
          }}
        />
      )}

      <div
        className="relative z-10 rounded-[28px] overflow-hidden shadow-2xl"
        style={{
          height: 580,
          background: "#010101",
          border: isActive ? "none" : "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {isActive && (
          <div className="absolute inset-0 overflow-hidden">
            {!loaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-[#010101]">
                <div className="relative w-12 h-12">
                  <div
                    className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "#69C9D0 transparent #EE1D52 #EE1D52" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z" />
                    </svg>
                  </div>
                </div>
                <span className="text-white/30 text-[10px] tracking-[0.2em] uppercase font-medium">
                  Loading
                </span>
              </div>
            )}

            <iframe
              key={iframeKey.current}
              src={embedSrc(video.id_titkok, typeof window !== "undefined" ? window.location.href : "")}
              style={{
                width: "100%",
                height: 900,
                marginTop: -60,
                border: "none",
                opacity: loaded ? 1 : 0,
                transition: "opacity 0.5s ease",
              }}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              scrolling="no"
              onLoad={() => setLoaded(true)}
              title={video.caption}
            />

            <div
              className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
              style={{
                height: 32,
                background: "linear-gradient(to bottom,#010101 50%,transparent)",
              }}
            />

            <div
              className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
              style={{
                height: 110,
                background: "linear-gradient(to top,#010101 55%,transparent)",
              }}
            />

            {loaded && (
              <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-5 pointer-events-none">
                <div className="flex items-center gap-2 mb-2">
                  <div>
                    <p className="text-white text-xs font-bold leading-none">{video.author}</p>
                    <p className="text-white/40 text-[10px] mt-0.5">{video.handle}</p>
                  </div>
                  <span
                    className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "#EE1D5220", color: "#EE1D52", border: "1px solid #EE1D5240" }}
                  >
                    #{video.tag}
                  </span>
                </div>

                <p className="text-white/70 text-[11px] font-light leading-relaxed line-clamp-2">
                  {video.caption}
                </p>

                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-white/40" style={{ color: "#69C9D0" }}>
                    <MusicNote />
                  </span>
                  <div className="overflow-hidden flex-1">
                    <p
                      className="text-[10px] whitespace-nowrap animate-marquee"
                      style={{ color: "#69C9D0", opacity: 0.7 }}
                    >
                      original sound · {video.author} &nbsp;&nbsp;&nbsp; original sound · {video.author}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!isActive && (
          <div
            className="absolute inset-0 flex flex-col items-end justify-between p-4"
            style={{
              background: "linear-gradient(160deg,#1a0a0a 0%,#010101 60%,#001a1a 100%)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 opacity-20">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z" />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(238,29,82,0.15)", border: "1px solid rgba(238,29,82,0.3)" }}
              >
                <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            <div className="w-full">
              <div className="flex items-center gap-1.5 mb-1">
                <img src={video.avatar?.url ? `${BASE_URL}${video.avatar.url}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(video.author)}&background=random`} alt="" className="w-5 h-5 rounded-full object-cover" />
                <span className="text-white/50 text-[10px]">{video.handle}</span>
              </div>
              <p className="text-white/40 text-[10px] leading-snug line-clamp-2">{video.caption}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TiktokReelsSection({ videos, title }: TiktokReelsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () => setActiveIndex((i) => Math.max(0, i - 1));
  const next = () => setActiveIndex((i) => Math.min(videos.length - 1, i + 1));

  if (videos.length === 0) return null;

  return (
    <div className="py-20 w-full" style={{ background: "#010101" }}>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 8s linear infinite;
          display: inline-block;
          width: max-content;
        }
      `}</style>

      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5">
            <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5 opacity-70">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z" />
            </svg>
            <span className="text-white/50 text-xs tracking-widest uppercase font-medium">
              TikTok
            </span>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#EE1D52" }} />
          </div>
          {title && (
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {title}
            </h2>
          )}
        </div>

        <div className="relative flex items-center justify-center gap-4 w-full">
          {videos.map((video, i) => (
            <TikTokCard
              key={video.id}
              video={video}
              isActive={i === activeIndex}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-5 mt-9">
          <motion.button
            onClick={prev}
            disabled={activeIndex === 0}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all disabled:opacity-15 disabled:cursor-not-allowed"
            style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          <div className="flex gap-2">
            {videos.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === activeIndex ? 24 : 6,
                  background:
                    i === activeIndex
                      ? "linear-gradient(90deg,#EE1D52,#69C9D0)"
                      : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>

          <motion.button
            onClick={next}
            disabled={activeIndex === videos.length - 1}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all disabled:opacity-15 disabled:cursor-not-allowed"
            style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
