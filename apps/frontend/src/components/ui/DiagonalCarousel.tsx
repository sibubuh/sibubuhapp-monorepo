import * as React from "react";
import { motion, type Transition } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface DiagonalCarouselItem {
  src: string;
  title: string;
  alt?: string;
}

export interface DiagonalCarouselProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  items: DiagonalCarouselItem[];
  activeIndex?: number;
  defaultActiveIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  loop?: boolean;
  slideSize?: number;
  rotationStep?: number;
  verticalStep?: number;
  inactiveScale?: number;
  transition?: Transition;
  showControls?: boolean;
  showDots?: boolean;
}

const DEFAULT_TRANSITION: Transition = {
  type: "spring",
  bounce: 0.16,
  duration: 0.85,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function DiagonalCarousel({
  items,
  activeIndex,
  defaultActiveIndex = 0,
  onActiveIndexChange,
  loop = false,
  slideSize = 260,
  rotationStep = 30,
  verticalStep = 120,
  inactiveScale = 0.6,
  transition = DEFAULT_TRANSITION,
  showControls = true,
  showDots = true,
  className = "",
  ...props
}: DiagonalCarouselProps) {
  const maxIndex = Math.max(0, items.length - 1);
  const [uncontrolledIndex, setUncontrolledIndex] = React.useState(() =>
    clamp(defaultActiveIndex, 0, maxIndex),
  );
  const currentIndex = clamp(activeIndex ?? uncontrolledIndex, 0, maxIndex);
  const safeSlideSize = Math.max(120, slideSize);
  const safeInactiveScale = clamp(inactiveScale, 0.35, 1);

  const selectSlide = React.useCallback(
    (nextIndex: number) => {
      if (!items.length) return;
      const resolvedIndex = loop
        ? (nextIndex + items.length) % items.length
        : clamp(nextIndex, 0, maxIndex);

      if (activeIndex === undefined) {
        setUncontrolledIndex(resolvedIndex);
      }
      onActiveIndexChange?.(resolvedIndex);
    },
    [activeIndex, items.length, loop, maxIndex, onActiveIndexChange],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectSlide(currentIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectSlide(currentIndex + 1);
    }
  };

  if (!items.length) return null;

  const isPreviousDisabled = !loop && currentIndex === 0;
  const isNextDisabled = !loop && currentIndex === maxIndex;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Diagonal image carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative isolate h-full w-full overflow-hidden ${className}`}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-1/2 top-[15%] flex w-fit"
          animate={{ x: -(currentIndex * safeSlideSize + safeSlideSize / 2) }}
          transition={transition}
        >
          {items.map((item, index) => {
            const isActive = currentIndex === index;
            const distance = index - currentIndex;

            return (
              <motion.div
                key={`${item.src}-${index}`}
                className="flex shrink-0 flex-col items-center gap-2 will-change-transform"
                style={{ width: safeSlideSize }}
                animate={{
                  rotate: distance * rotationStep,
                  scale: isActive ? 1 : safeInactiveScale,
                  y: distance * verticalStep,
                }}
                transition={transition}
              >
                <motion.p
                  className="whitespace-nowrap text-sm text-white/80 font-medium tracking-wide"
                  animate={{
                    opacity: isActive ? 1 : 0,
                    scale: isActive ? 1 : 0.7,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {item.title}
                </motion.p>

                <button
                  type="button"
                  aria-label={`Show ${item.title}`}
                  aria-current={isActive ? "true" : undefined}
                  className="aspect-[4/3] w-full cursor-pointer"
                  onClick={() => selectSlide(index)}
                >
                  <img
                    src={item.src}
                    alt={item.alt ?? item.title}
                    draggable={false}
                    className="h-full w-full select-none rounded-2xl object-cover shadow-card"
                  />
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {showControls && (
        <div className="absolute inset-x-4 bottom-5 z-10 mx-auto flex w-fit items-center justify-center gap-3 rounded-full border border-ink-border bg-ink-foreground/10 px-2 text-ink-foreground backdrop-blur-md">
          <button
            type="button"
            aria-label="Show previous slide"
            disabled={isPreviousDisabled}
            className="inline-flex size-9 items-center justify-center rounded-full transition-colors hover:bg-ink-foreground/20 disabled:cursor-not-allowed disabled:opacity-35"
            onClick={() => selectSlide(currentIndex - 1)}
          >
            <ChevronLeft className="size-5" />
          </button>

          {showDots && (
            <div className="flex items-center justify-center gap-2">
              {items.map((item, index) => (
                <button
                  key={`${item.title}-${index}`}
                  type="button"
                  aria-label={`Show slide ${index + 1}: ${item.title}`}
                  aria-current={currentIndex === index ? "true" : undefined}
                  className={`h-2 rounded-full bg-current transition-[width,opacity] duration-300 ${
                    currentIndex === index
                      ? "w-7 opacity-100"
                      : "w-2 opacity-30"
                  }`}
                  onClick={() => selectSlide(index)}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            aria-label="Show next slide"
            disabled={isNextDisabled}
            className="inline-flex size-9 items-center justify-center rounded-full transition-colors hover:bg-ink-foreground/20 disabled:cursor-not-allowed disabled:opacity-35"
            onClick={() => selectSlide(currentIndex + 1)}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}

