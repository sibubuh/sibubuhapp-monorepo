import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimelineEvent {
  year: string;
  month: string;
  title: string;
  body: string;
  accent: string;
  tag: string;
  tagBg: string;
  tagColor: string;
}

type PipState = "active" | "near" | "idle";

export type { TimelineEvent };

// ─── Data ─────────────────────────────────────────────────────────────────────

const DEFAULT_EVENTS: TimelineEvent[] = [
  {
    year: "2019",
    month: "March",
    title: "The Seed",
    body: "A single idea forms — rough, uncertain, barely a sketch on a receipt. The kind that doesn't let you sleep.",
    accent: "#F0A030",
    tag: "origin",
    tagBg: "rgba(240,160,48,0.14)",
    tagColor: "#F5BB6A",
  },
  {
    year: "2020",
    month: "November",
    title: "First Signal",
    body: "After eighteen months of silence, something clicks. The prototype works. Not perfectly — but enough to prove it deserves to exist.",
    accent: "#4E9EE8",
    tag: "breakthrough",
    tagBg: "rgba(78,158,232,0.14)",
    tagColor: "#7DBEF0",
  },
  {
    year: "2021",
    month: "June",
    title: "The Pivot",
    body: "Everything we built had to be rethought. Market shifted. Painful but clarifying — constraints breed ingenuity.",
    accent: "#E05C5C",
    tag: "challenge",
    tagBg: "rgba(224,92,92,0.14)",
    tagColor: "#F08888",
  },
  {
    year: "2022",
    month: "February",
    title: "The Team",
    body: "Five people who shouldn't work together somehow do. Complementary flaws, shared conviction. We became something.",
    accent: "#4DB87A",
    tag: "people",
    tagBg: "rgba(77,184,122,0.13)",
    tagColor: "#72D49A",
  },
  {
    year: "2023",
    month: "September",
    title: "Crossing Over",
    body: "The day the outside world noticed. Not viral — just a steady quiet signal that what we were making had found its people.",
    accent: "#8B7FE8",
    tag: "milestone",
    tagBg: "rgba(139,127,232,0.14)",
    tagColor: "#B0A8F5",
  },
  {
    year: "2024",
    month: "April",
    title: "Now",
    body: "Still building. The finish line keeps moving, and that's the point. This is where the interesting part begins.",
    accent: "#F0A030",
    tag: "present",
    tagBg: "rgba(240,160,48,0.14)",
    tagColor: "#F5BB6A",
  },
];

// ─── YearPip ──────────────────────────────────────────────────────────────────

function YearPip({
  year,
  state,
  onClick,
}: {
  year: string;
  state: PipState;
  onClick: () => void;
}) {
  const isActive = state === "active";
  const isNear   = state === "near";

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer py-1 outline-none"
    >
      {/* Dot */}
      <span
        className={[
          "block rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isActive
            ? "w-3 h-3 bg-[#E8EDF5]"
            : isNear
            ? "w-2.5 h-2.5 bg-[#4A5E7A]"
            : "w-2 h-2 bg-[#1E2D47]",
        ].join(" ")}
      />
      {/* Label */}
      <span
        className={[
          "whitespace-nowrap select-none transition-all duration-300 tracking-[0.05em]",
          isActive
            ? "text-[15px] font-medium text-[#E8EDF5]"
            : isNear
            ? "text-xs font-normal text-[#7B8BAA]"
            : "text-[11px] font-normal text-[#354160]",
        ].join(" ")}
      >
        {year}
      </span>
    </button>
  );
}

// ─── TimelineSection ──────────────────────────────────────────────────────────

function TimelineSection({
  event,
  isActive,
  isVisible,
  sectionRef,
}: {
  event: TimelineEvent;
  isActive: boolean;
  isVisible: boolean;
  sectionRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={sectionRef}
      className={[
        "relative min-h-[380px] py-12 border-b border-white/[0.08]",
        "flex flex-col justify-center",
        "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6",
      ].join(" ")}
    >
      {/* Connector line from sidebar spine */}
      <div
        className={[
          "absolute top-1/2 -translate-y-1/2 -left-8 h-px transition-all duration-300",
          isActive ? "bg-white/55" : "bg-white/10",
        ].join(" ")}
        style={{ width: isActive ? 28 : 20 }}
      />

      {/* Ghost year watermark */}
      <div
        className={[
          "font-serif text-[64px] font-medium leading-none tracking-[-0.04em] mb-1 select-none",
          "text-[#E8EDF5] transition-opacity duration-500",
          isActive ? "opacity-100" : "opacity-[0.06]",
        ].join(" ")}
      >
        {event.year}
      </div>

      {/* Month */}
      <div
        className={[
          "text-[11px] font-medium tracking-[0.15em] uppercase mb-5 transition-colors duration-300",
          isActive ? "text-[#A8BCDA]" : "text-[#354160]",
        ].join(" ")}
      >
        {event.month}
      </div>

      {/* Accent bar */}
      <div
        className="h-0.5 rounded-sm mb-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          width: isActive ? 52 : 28,
          background: event.accent,
        }}
      />

      {/* Title */}
      <h3 className="text-[22px] font-medium leading-snug text-[#E8EDF5] mb-3.5 mt-0">
        {event.title}
      </h3>

      {/* Body */}
      <p className="text-sm leading-[1.75] text-[#7B8BAA] max-w-[560px] m-0">
        {event.body}
      </p>

      {/* Tag pill */}
      <span
        className="inline-flex items-center self-start mt-5 px-3 py-1 rounded-full text-[11px] font-medium tracking-[0.05em] border"
        style={{
          background: event.tagBg,
          color: event.tagColor,
          borderColor: `${event.tagColor}33`,
        }}
      >
        {event.tag}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ScrollZoomTimelineProps {
  /**
   * Height of your fixed/sticky navbar in px.
   * The sidebar sticks just below it. Default: 72.
   */
  navHeight?: number;
  events?: TimelineEvent[];
}

export default function ScrollZoomTimeline({
  navHeight = 72,
  events,
}: ScrollZoomTimelineProps) {
  const timelineEvents = events && events.length > 0 ? events : DEFAULT_EVENTS;

  const [activeIdx,  setActiveIdx]  = useState(0);
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());
  const [linePct,    setLinePct]    = useState(0);
  const [sidebarH,   setSidebarH]   = useState(560);

  const wrapRef     = useRef<HTMLElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef      = useRef<number | null>(null);

  // Recalculate sidebar height on resize
  useEffect(() => {
    const calc = () =>
      setSidebarH(Math.min(560, window.innerHeight - navHeight - 32));
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [navHeight]);

  const onScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const usableMid = navHeight + (window.innerHeight - navHeight) * 0.45;
      let closest = 0;
      let minDist = Infinity;

      sectionRefs.current.forEach((el, i) => {
        if (!el) return;
        const r      = el.getBoundingClientRect();
        const secMid = r.top + r.height / 2;
        const dist   = Math.abs(secMid - usableMid);
        if (dist < minDist) { minDist = dist; closest = i; }
      });

      setActiveIdx(closest);

      const wrap = wrapRef.current;
      if (wrap) {
        const wRect    = wrap.getBoundingClientRect();
        const totalH   = wrap.scrollHeight - window.innerHeight;
        const scrolled = Math.max(0, -wRect.top);
        setLinePct(Math.min(100, (scrolled / Math.max(1, totalH)) * 100));
      }
    });
  }, [navHeight]);

  // IntersectionObserver — fade sections in as they enter viewport
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = parseInt(
              (e.target as HTMLElement).dataset.idx ?? "0",
              10
            );
            setVisibleSet((prev) => new Set([...prev, idx]));
          }
        });
      },
      { threshold: 0.1, rootMargin: `-${navHeight}px 0px 0px 0px` }
    );
    sectionRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [navHeight]);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const scrollToSection = (i: number) => {
    const el = sectionRefs.current[i];
    if (!el) return;
    const y =
      el.getBoundingClientRect().top + window.scrollY - navHeight - 32;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const pipState = (i: number): PipState => {
    if (i === activeIdx) return "active";
    if (Math.abs(i - activeIdx) === 1) return "near";
    return "idle";
  };

  return (
    <div className="w-full min-h-screen bg-[#0E172B]">
    <section
      ref={wrapRef}
      className="flex relative max-w-7xl mx-auto px-16 py-20 box-border"
    >
      {/* ── Sticky Sidebar ──────────────────────────────────────────────── */}
      <div
        className="w-24 flex-shrink-0 sticky self-start flex flex-col items-center py-8"
        style={{ top: navHeight, height: sidebarH }}
      >
        {/* Spine track */}
        <div className="absolute left-1/2 -translate-x-1/2 top-7 bottom-7 w-px bg-white/10">
          {/* Progress fill */}
          <div
            className="absolute top-0 left-0 w-full bg-white/55 transition-[height] duration-[50ms] linear"
            style={{ height: `${linePct}%` }}
          />
        </div>

        {/* Year pips */}
        <div className="relative z-10 flex flex-col justify-between items-center h-full w-full">
          {timelineEvents.map((ev, i) => (
            <YearPip
              key={ev.year}
              year={ev.year}
              state={pipState(i)}
              onClick={() => scrollToSection(i)}
            />
          ))}
        </div>
      </div>

      {/* ── Timeline Content ─────────────────────────────────────────────── */}
      <div className="flex-1 pl-12">
        {timelineEvents.map((ev, i) => (
          <TimelineSection
            key={ev.year}
            event={ev}
            isActive={i === activeIdx}
            isVisible={visibleSet.has(i)}
            sectionRef={(el) => {
              sectionRefs.current[i] = el;
              if (el) el.dataset.idx = String(i);
            }}
          />
        ))}

        {/* End cap */}
        <div className="flex flex-col items-start pt-10 gap-2">
          <div className="w-px h-8 bg-white/10" />
          <div className="w-2 h-2 rounded-full bg-[#F0A030]" />
          <span className="text-[11px] tracking-[0.12em] uppercase text-[#354160] mt-1">
            Ongoing
          </span>
        </div>
      </div>
    </section>
    </div>
  );
}
