import { useState, useEffect, useRef, type MouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { getSocialMedia } from "../../../services/api";
import type { SocialMedia, SocialMediaItem } from "../../../types/social-media";
import StrapiBlocks from "../sections/StrapiBlocks";
import TextAnimation from "../ui/staggerText";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ─── Shelf motion variants ─── */
const shelfContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const shelfCardVariants = {
  hidden: { x: 40, opacity: 0, scale: 0.9 },
  show: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE },
  },
};

/* ─── Loading skeleton stagger ─── */
const skeletonContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};
const skeletonItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

/* ─── 3D Tilt Card with Glare ─── */
function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glareX, setGlareX] = useState(50);
  const [glareY, setGlareY] = useState(50);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRotateX(((y - rect.height / 2) / (rect.height / 2)) * -10);
    setRotateY(((x - rect.width / 2) / (rect.width / 2)) * 10);
    setGlareX((x / rect.width) * 100);
    setGlareY((y / rect.height) * 100);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden rounded-2xl will-change-transform"
      style={{
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: isHovered ? "none" : "transform 0.5s ease",
      }}
    >
      {children}

      {/* Glare spotlight following cursor */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0.3 : 0,
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.8) 0%, transparent 60%)`,
        }}
      />
    </div>
  );
}

/* ─── Main Component ─── */
const SocialMediaSection = () => {
  const [active, setActive] = useState<SocialMediaItem | null>(null);
  const [socialData, setSocialData] = useState<SocialMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;

  // 📦 Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSocialMedia({ locale: null });
        setSocialData(data);
      } catch (error) {
        console.error("Failed to fetch social media:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ⌨️ ESC to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Scroll helpers
  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -320 : 320;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="py-20 md:py-32 overflow-hidden">
      {/* TITLE with word-stagger reveal */}
      <div className="mb-12 md:mb-16 px-4 md:px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900 dark:text-zinc-100">
          <TextAnimation delay={0.05} divideBy="word">
            {socialData?.title || "My All Publication"}
          </TextAnimation>
        </h2>
      </div>

      {/* CONTENT */}
      {loading ? (
        <motion.div
          variants={skeletonContainer}
          initial="hidden"
          animate="show"
          className="overflow-x-auto pb-4 px-4 md:px-8"
        >
          <div className="flex gap-6 md:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                variants={skeletonItem}
                className="flex-shrink-0 w-56 md:w-72"
              >
                <div className="aspect-[4/5] bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
                <div className="h-5 bg-gray-200 dark:bg-zinc-800 rounded w-24 mt-3 md:mt-4 animate-pulse" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : socialData?.social && socialData.social.length > 0 ? (
        <div className="relative group/shelf">
          {/* Gradient edge mask for scroll hint (right only) */}
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 md:w-24 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent" />

          {/* Arrow buttons */}
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur shadow-lg border border-neutral-200 dark:border-zinc-700 flex items-center justify-center opacity-0 group-hover/shelf:opacity-100 transition-opacity duration-300 hover:bg-neutral-900 dark:hover:bg-zinc-100 hover:text-white dark:hover:text-black"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur shadow-lg border border-neutral-200 dark:border-zinc-700 flex items-center justify-center opacity-0 group-hover/shelf:opacity-100 transition-opacity duration-300 hover:bg-neutral-900 dark:hover:bg-zinc-100 hover:text-white dark:hover:text-black"
          >
            <ChevronRight size={20} />
          </button>

          {/* Horizontal scroll shelf — left aligned start */}
          <div
            ref={scrollRef}
            className="overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin px-4 md:px-8"
          >
            <motion.div
              variants={shelfContainerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="flex gap-6 md:gap-8"
            >
              {socialData.social.map((item, i) => (
                <motion.div
                  key={item.id || i}
                  variants={shelfCardVariants}
                  className="flex-shrink-0 w-56 md:w-72 snap-start group cursor-pointer"
                  onClick={() => setActive(item)}
                >
                  <TiltCard>
                    <div className="aspect-[4/5] bg-gray-100 dark:bg-zinc-800 overflow-hidden rounded-2xl">
                      <img
                        src={`${BASE_URL}${item.thumbnail?.url}`}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                        alt={item.name}
                      />
                    </div>
                  </TiltCard>
                  <h3 className="mt-3 md:mt-4 text-lg md:text-xl font-bold text-neutral-900 dark:text-zinc-100">
                    {item.name}
                  </h3>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="text-center text-neutral-400 py-12">
          No social media items available.
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="
                relative bg-white dark:bg-zinc-900 w-full md:max-w-4xl
                rounded-t-3xl md:rounded-2xl
                max-h-[90vh] overflow-y-auto shadow-xl
              "
              initial={{ y: "100%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 28, mass: 0.8 }}
            >
              {/* CLOSE BUTTON */}
              <button
                onClick={() => setActive(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur hover:bg-neutral-900 dark:hover:bg-zinc-100 hover:text-white dark:hover:text-black transition"
              >
                <X size={20} />
              </button>

              {/* IMAGE */}
              <div className="aspect-video bg-gray-100 dark:bg-zinc-800">
                <img
                  src={`${BASE_URL}${active.thumbnail?.url}`}
                  className="w-full h-full object-cover"
                  alt={active.name}
                />
              </div>

              {/* CONTENT */}
              <div className="p-5 md:p-8">
                <h3 className="text-xl md:text-2xl font-bold mb-4">
                  {active.name}
                </h3>

                <div className="prose prose-sm md:prose-lg max-w-none mb-6">
                  <StrapiBlocks data={active.description} />
                </div>

                <a
                  href={active.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full md:w-auto text-center px-6 py-3 bg-neutral-900 dark:bg-white dark:text-black text-white rounded-full text-sm font-medium hover:bg-indigo-600 transition-colors"
                >
                  Visit Page
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default SocialMediaSection;
