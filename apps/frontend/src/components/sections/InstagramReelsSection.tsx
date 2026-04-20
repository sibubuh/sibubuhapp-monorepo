import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ImageType } from "../types/image";

const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;

interface Reel {
  id: number;
  url_id: string;
  caption: string;
  author: string;
  avatar?: ImageType | null;
}

interface InstagramReelsSectionProps {
  reels: Reel[];
  title?: string;
}

const embedUrl = (urlId: string) => {
  return `https://www.instagram.com/reel/${urlId}/embed/`;
};

function ReelCard({
  reel,
  isActive,
  onClick,
}: {
  reel: Reel & { url: string };
  isActive: boolean;
  onClick: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  console.log("avatar url:", reel); // Debugging log
  return (
    <div
      onClick={onClick}
      className={`
        group relative flex-shrink-0 cursor-pointer transition-all duration-500 ease-out
        ${
          isActive
            ? "z-10 scale-100 opacity-100"
            : "scale-90 opacity-50 hover:opacity-70 hover:scale-[0.92]"
        }
      `}
      style={{ width: isActive ? 500 : 300 }}
    >
      {isActive && (
        <div
          className="absolute -inset-[3px] rounded-[28px] z-0"
          style={{
            background: "linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4)",
            filter: "blur(6px)",
            opacity: 0.85,
          }}
        />
      )}

      <div
        className="relative z-10 rounded-[26px] overflow-hidden bg-black shadow-2xl"
        style={{ height: 560 }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {isActive ? (
            <>
              {!loaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a] z-10">
                  <div
                    className="w-9 h-9 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "#dd2a7b transparent #dd2a7b #dd2a7b" }}
                  />
                  <span className="text-white/30 text-[10px] tracking-widest uppercase">
                    Loading
                  </span>
                </div>
              )}
              <iframe
                key={reel.id}
                src={reel.url}
                style={{
                  width: "100%",
                  height: 780,
                  marginTop: -82,
                  border: "none",
                  opacity: loaded ? 1 : 0,
                  transition: "opacity 0.4s ease",
                }}
                scrolling="no"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
                onLoad={() => setLoaded(true)}
                title={reel.caption}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a0a2e] to-[#0a0a0a]">
              <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <svg
                  className="w-6 h-6 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                <p className="text-white/70 text-xs font-light truncate">{reel.caption}</p>
                <p className="text-white/40 text-[10px] mt-1">{reel.author}</p>
              </div>
            </div>
          )}
        </div>

        <div
          className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
          style={{
            height: 28,
            background: "linear-gradient(to bottom, #000 55%, transparent)",
          }}
        />

        <div
          className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
          style={{
            height: 80,
            background: "linear-gradient(to top, #000 50%, transparent)",
          }}
        />

        {isActive && loaded && (
          <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-4 pointer-events-none">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white text-xs font-semibold">{reel.author}</span>
            </div>
            <p className="text-white/70 text-xs font-light leading-snug">{reel.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InstagramReelsSection({ reels, title }: InstagramReelsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if ((window as any).instgrm) {
      (window as any).instgrm.Embeds.process();
    } else {
      const s = document.createElement("script");
      s.src = "//www.instagram.com/embed.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  const reelsWithUrl = reels.map((r) => ({
    ...r,
    url: embedUrl(r.url_id),
  }));

  const prev = () => setActiveIndex((i) => Math.max(0, i - 1));
  const next = () => setActiveIndex((i) => Math.min(reelsWithUrl.length - 1, i + 1));

  if (reels.length === 0) return null;

  return (
    <div className="py-20 bg-[#050505] w-full">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur mb-4">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-white/50 text-xs tracking-widest uppercase font-medium">
              Instagram Reels
            </span>
          </div>
          {title && (
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {title}
            </h2>
          )}
        </div>

        <div className="relative flex items-center justify-center gap-5 w-full">
          {reelsWithUrl.map((reel, i) => (
            <ReelCard
              key={reel.id}
              reel={reel}
              isActive={i === activeIndex}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-5 mt-8">
          <motion.button
            onClick={prev}
            disabled={activeIndex === 0}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          <div className="flex gap-2">
            {reelsWithUrl.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "w-6 bg-gradient-to-r from-pink-500 to-purple-500"
                    : "w-1.5 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>

          <motion.button
            onClick={next}
            disabled={activeIndex === reelsWithUrl.length - 1}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
