import { motion } from 'motion/react';
import { useRef, useState, useEffect } from 'react';

export default function PortfolioSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      const scrollWidth = containerRef.current.scrollWidth;
      const offsetWidth = containerRef.current.offsetWidth;
      setWidth(scrollWidth - offsetWidth);
    }
  }, []);

  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="px-6 max-w-7xl mx-auto mb-16">
        <h2 className="text-5xl font-bold tracking-tight text-neutral-900">
          Selected Case Studies
        </h2>
      </div>

      <motion.div
        ref={containerRef}
        className="overflow-hidden"
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: -width, right: 0 }}
          className="flex gap-10 px-6 cursor-grab active:cursor-grabbing"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              whileHover={{ y: -15 }}
              className="min-w-[80vw] md:min-w-[450px] group"
            >
              <div className="aspect-[16/10] bg-neutral-100 rounded-[2rem] overflow-hidden">
                <img
                  src={`https://picsum.photos/900/600?random=${i}`}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>

              <div className="mt-6 flex justify-between items-start">
                <h3 className="text-2xl font-bold uppercase tracking-tighter">
                  Project Name {i}
                </h3>
                <span className="text-neutral-400 font-mono">/ 2026</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
