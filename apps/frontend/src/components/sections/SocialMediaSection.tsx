import { useState, useEffect, useRef } from "react";
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
  hidden: { y: 16, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: EASE },
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
    <section className="bg-background py-20 md:py-28 overflow-hidden">
      {/* TITLE with word-stagger reveal */}
      <div className="mx-auto mb-12 max-w-7xl border-b border-border px-6 pb-8">
        <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl">
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
          className="overflow-x-auto px-6 pb-4"
        >
          <div className="mx-auto flex max-w-7xl gap-6 md:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                variants={skeletonItem}
                className="w-56 flex-shrink-0 md:w-72"
              >
                <div className="aspect-[4/5] animate-pulse rounded-lg bg-muted" />
                <div className="mt-4 h-5 w-24 animate-pulse rounded bg-muted" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : socialData?.social && socialData.social.length > 0 ? (
        <div className="group/shelf relative">
          {/* Edge mask for scroll hint (right only) */}
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent md:w-24" />

          {/* Arrow buttons */}
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground opacity-0 shadow-card transition-opacity duration-300 hover:bg-secondary focus-visible:opacity-100 group-hover/shelf:opacity-100 md:left-6"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground opacity-0 shadow-card transition-opacity duration-300 hover:bg-secondary focus-visible:opacity-100 group-hover/shelf:opacity-100 md:right-6"
          >
            <ChevronRight size={18} />
          </button>

          {/* Horizontal scroll shelf — left aligned start */}
          <div
            ref={scrollRef}
            className="snap-x snap-mandatory overflow-x-auto px-6 pb-4"
          >
            <motion.div
              variants={shelfContainerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="mx-auto flex max-w-7xl gap-6 md:gap-8"
            >
              {socialData.social.map((item, i) => (
                <motion.button
                  type="button"
                  key={item.id || i}
                  variants={shelfCardVariants}
                  className="group w-56 flex-shrink-0 snap-start text-left md:w-72"
                  onClick={() => setActive(item)}
                >
                  <div className="aspect-[4/5] overflow-hidden rounded-lg bg-muted">
                    <img
                      src={`${BASE_URL}${item.thumbnail?.url}`}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      alt={item.name}
                    />
                  </div>
                  <h3 className="mt-4 font-sans text-base font-medium text-foreground transition-colors group-hover:text-primary">
                    {item.name}
                  </h3>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="px-6 py-12 text-center font-sans text-base text-muted-foreground">
          No social media items available.
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/60 backdrop-blur-sm md:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="
                relative max-h-[90vh] w-full overflow-y-auto bg-card text-card-foreground
                rounded-t-2xl shadow-card md:max-w-3xl md:rounded-xl
              "
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
            >
              {/* CLOSE BUTTON */}
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Close"
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
              >
                <X size={18} />
              </button>

              {/* IMAGE */}
              <div className="aspect-video bg-muted">
                <img
                  src={`${BASE_URL}${active.thumbnail?.url}`}
                  className="h-full w-full object-cover"
                  alt={active.name}
                />
              </div>

              {/* CONTENT */}
              <div className="p-6 md:p-10">
                <h3 className="font-serif text-2xl font-medium tracking-tight md:text-3xl">
                  {active.name}
                </h3>

                <div className="mt-5 font-sans text-base text-muted-foreground">
                  <StrapiBlocks data={active.description} />
                </div>

                <a
                  href={active.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-sans text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 md:w-auto"
                >
                  Visit Page
                  <span aria-hidden="true">&rarr;</span>
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
