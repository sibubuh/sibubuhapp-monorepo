import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const embedUrl = (urlId: string) =>
  `https://www.instagram.com/reel/${urlId}/embed/captioned/`;

const avatarSrc = (avatar?: ImageType | null) =>
  avatar?.url ? `${BASE_URL}${avatar.url}` : null;

/* ─────────────────────────────────────────
   Dot strip — scrollable, active dot centers
───────────────────────────────────────── */
function DotStrip({
  total,
  active,
  onSelect,
}: {
  total: number;
  active: number;
  onSelect: (i: number) => void;
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const strip = stripRef.current;
    const dot = dotRefs.current[active];
    if (!strip || !dot) return;
    const scrollLeft = dot.offsetLeft - strip.offsetWidth / 2 + dot.offsetWidth / 2;
    strip.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, [active]);

  return (
    <div
      ref={stripRef}
      className="flex gap-2 overflow-x-hidden"
      style={{ maxWidth: 180 }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          ref={(el) => { dotRefs.current[i] = el; }}
          onClick={() => onSelect(i)}
          className="flex-shrink-0 h-1.5 rounded-full transition-all duration-300"
          style={{
            width: i === active ? 24 : 6,
            background:
              i === active
                ? "linear-gradient(90deg,#f58529,#dd2a7b,#8134af)"
                : "rgba(255,255,255,0.2)",
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   Desktop carousel card
   Scroll logic lives in the parent — this
   component just receives a ref to attach.
───────────────────────────────────────── */
function ReelCard({
  reel,
  isActive,
  onClick,
  allowIframe,
  cardRef,
}: {
  reel: Reel & { url: string };
  isActive: boolean;
  onClick: () => void;
  allowIframe: boolean;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isActive) setLoaded(false);
  }, [isActive]);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={`
        group relative flex-shrink-0 cursor-pointer
        transition-all duration-500 ease-out
        ${isActive
          ? "z-10 scale-100 opacity-100"
          : "scale-[0.85] opacity-40 hover:opacity-65 hover:scale-[0.88]"}
      `}
      style={{ width: isActive ? 500 : 300 }}
    >
      {isActive && (
        <div
          className="absolute -inset-[3px] rounded-[28px] z-0"
          style={{
            background: "linear-gradient(135deg,#f58529,#dd2a7b,#8134af,#515bd4)",
            filter: "blur(7px)",
            opacity: 0.85,
          }}
        />
      )}

      <div
        className="relative z-10 rounded-[26px] overflow-hidden bg-black shadow-2xl"
        style={{ height: 600 }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {isActive && allowIframe ? (
            <>
              {!loaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a] z-10">
                  <div
                    className="w-9 h-9 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "#dd2a7b transparent #dd2a7b #dd2a7b" }}
                  />
                  <span className="text-white/30 text-[10px] tracking-widest uppercase">Loading</span>
                </div>
              )}
              <iframe
                tabIndex={-1}
                loading="lazy"
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
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                <p className="text-white/60 text-[11px] truncate">{reel.caption}</p>
                <p className="text-white/30 text-[10px] mt-0.5">{reel.author}</p>
              </div>
            </div>
          )}
        </div>

        <div
          className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
          style={{ height: 28, background: "linear-gradient(to bottom,#000 55%,transparent)" }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
          style={{ height: 80, background: "linear-gradient(to top,#000 50%,transparent)" }}
        />

        {isActive && loaded && (
          <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-4 pointer-events-none">
            <div className="flex items-center gap-2 mb-1">
              {avatarSrc(reel.avatar) ? (
                <img
                  src={avatarSrc(reel.avatar)!}
                  alt={reel.author}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-pink-500"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-pink-500">
                  {reel.author?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <span className="text-white text-xs font-semibold">{reel.author}</span>
            </div>
            <p className="text-white/70 text-[11px] font-light leading-snug line-clamp-2">
              {reel.caption}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Mobile full-screen viewer
───────────────────────────────────────── */
function MobileReelViewer({
  reels,
  activeIndex,
  onChangeIndex,
  allowIframe,
}: {
  reels: (Reel & { url: string })[];
  activeIndex: number;
  onChangeIndex: (i: number) => void;
  allowIframe: boolean;
}) {
  const [loadedMap, setLoadedMap] = useState<Record<number, boolean>>({});
  const startY = useRef(0);

  const markLoaded = (id: number) =>
    setLoadedMap((prev) => ({ ...prev, [id]: true }));

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dy = startY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) < 40) return;
    if (dy > 0) onChangeIndex(Math.min(reels.length - 1, activeIndex + 1));
    else onChangeIndex(Math.max(0, activeIndex - 1));
  };

  const reel = reels[activeIndex];
  const loaded = loadedMap[reel.id] ?? false;

  return (
    <div
      className="relative w-full"
      style={{ height: "calc(100svh - 80px)", maxHeight: 700 }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={reel.id}
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0 rounded-[24px] overflow-hidden bg-black shadow-2xl"
        >
          <div
            className="absolute -inset-[2px] rounded-[24px] pointer-events-none"
            style={{
              background: "linear-gradient(135deg,#f58529,#dd2a7b,#8134af,#515bd4)",
              filter: "blur(5px)",
              opacity: 0.7,
            }}
          />
          <div className="absolute inset-0 z-10 rounded-[24px] overflow-hidden bg-black">
            {!allowIframe ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a]">
                <div
                  className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "#dd2a7b transparent #dd2a7b #dd2a7b" }}
                />
                <span className="text-white/30 text-[10px] tracking-widest uppercase">Loading</span>
              </div>
            ) : (
              <>
                {!loaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a] z-10">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: "#dd2a7b transparent #dd2a7b #dd2a7b" }}
                    />
                    <span className="text-white/30 text-[10px] tracking-widest uppercase">Loading</span>
                  </div>
                )}
                <iframe
                  tabIndex={-1}
                  key={reel.id}
                  src={reel.url}
                  style={{
                    width: "100%",
                    height: "calc(100% + 240px)",
                    marginTop: -82,
                    border: "none",
                    opacity: loaded ? 1 : 0,
                    transition: "opacity 0.4s ease",
                  }}
                  scrolling="no"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                  onLoad={() => markLoaded(reel.id)}
                  title={reel.caption}
                />
              </>
            )}

            <div
              className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
              style={{ height: 32, background: "linear-gradient(to bottom,#000 55%,transparent)" }}
            />
            <div
              className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
              style={{ height: 100, background: "linear-gradient(to top,#000 55%,transparent)" }}
            />
            {loaded && (
              <div className="absolute bottom-0 left-0 right-0 z-30 px-5 pb-5 pointer-events-none">
                <div className="flex items-center gap-2.5 mb-2">
                  {avatarSrc(reel.avatar) ? (
                    <img
                      src={avatarSrc(reel.avatar)!}
                      alt={reel.author}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-pink-500"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-pink-500">
                      {reel.author?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <div>
                    <p className="text-white text-sm font-semibold leading-none">{reel.author}</p>
                    <p className="text-white/40 text-[10px] mt-0.5">Instagram Reel</p>
                  </div>
                </div>
                <p className="text-white/75 text-xs leading-relaxed line-clamp-2">{reel.caption}</p>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Side pill indicators */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1 pointer-events-none">
        {reels.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: 3,
              height: i === activeIndex ? 18 : 6,
              background:
                i === activeIndex
                  ? "linear-gradient(to bottom,#f58529,#dd2a7b)"
                  : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>

      {activeIndex < reels.length - 1 && (
        <motion.div
          className="absolute bottom-[-26px] left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        >
          <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Main export
───────────────────────────────────────── */
export default function InstagramReelsSection({ reels, title }: InstagramReelsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [allowIframe, setAllowIframe] = useState(false);

  // Track ref for scrolling the carousel container (never touches window scroll)
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isFirstRender = useRef(true);

  // Defer iframe injection until after page load to prevent focus hijack
  useEffect(() => {
    const enable = () => setTimeout(() => setAllowIframe(true), 300);
    if (document.readyState === "complete") enable();
    else {
      window.addEventListener("load", enable, { once: true });
      return () => window.removeEventListener("load", enable);
    }
  }, []);

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

  // Scroll only the carousel TRACK to center the active card — page never moves
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const track = trackRef.current;
    const card = cardRefs.current[activeIndex];
    if (!track || !card) return;
    const targetScrollLeft =
      card.offsetLeft - track.offsetWidth / 2 + card.offsetWidth / 2;
    track.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
  }, [activeIndex]);

  const reelsWithUrl = reels.map((r) => ({ ...r, url: embedUrl(r.url_id) }));

  const goTo = useCallback(
    (i: number) => {
      const validIndex = Math.max(0, Math.min(reelsWithUrl.length - 1, i));
      setActiveIndex(validIndex);
    },
    [reelsWithUrl.length]
  );

  if (reels.length === 0) return null;

  return (
    <section className="py-16 bg-[#050505] w-full overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-pink-600/8 blur-[110px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-purple-700/8 blur-[110px]" />
      </div>

      <div className="w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur mb-4">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-white/50 text-xs tracking-widest uppercase font-medium">
              Instagram Reels
            </span>
          </div>
          {title && (
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{title}</h2>
          )}
        </div>

        {/* ── MOBILE ── */}
        <div className="block md:hidden px-6">
          <MobileReelViewer
            reels={reelsWithUrl}
            activeIndex={activeIndex}
            onChangeIndex={goTo}
            allowIframe={allowIframe}
          />
          <div className="flex items-center justify-center gap-4 mt-8">
            <motion.button
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            <DotStrip total={reelsWithUrl.length} active={activeIndex} onSelect={goTo} />
            <motion.button
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex === reelsWithUrl.length - 1}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* ── DESKTOP ── */}
        <div className="hidden md:block">
          <div
            ref={trackRef}
            className="flex items-center gap-5 w-full overflow-x-auto scroll-smooth py-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Leading spacer — allows first card to center */}
            <div className="flex-shrink-0" style={{ width: "calc(50vw - 150px)" }} />

            {reelsWithUrl.map((reel, i) => (
              <ReelCard
                key={reel.id}
                reel={reel}
                isActive={i === activeIndex}
                onClick={() => goTo(i)}
                allowIframe={allowIframe}
                cardRef={(el) => { cardRefs.current[i] = el; }}
              />
            ))}

            {/* Trailing spacer — allows last card to center */}
            <div className="flex-shrink-0" style={{ width: "calc(50vw - 150px)" }} />
          </div>

          {/* Desktop controls */}
          <div className="flex items-center justify-center gap-5 mt-2 px-4">
            <motion.button
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            <DotStrip total={reelsWithUrl.length} active={activeIndex} onSelect={goTo} />

            <motion.button
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex === reelsWithUrl.length - 1}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
