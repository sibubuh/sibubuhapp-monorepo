import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  { id: 1, title: "Nexus Studio", sub: "Architects of the modern web.", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1920" },
  { id: 2, title: "Pure Design", sub: "Where logic meets visual art.", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1920" }
];

export default function HeroSlider() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen bg-neutral-950 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img src={slides[idx].img} className="w-full h-full object-cover opacity-40" alt="" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.h1
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-7xl md:text-9xl font-black text-white tracking-tighter"
            >
              {slides[idx].title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-neutral-400 mt-4 tracking-widest uppercase"
            >
              {slides[idx].sub}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
