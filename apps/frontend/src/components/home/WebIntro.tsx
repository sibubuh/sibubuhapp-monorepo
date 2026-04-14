import { motion } from 'framer-motion';

const WebIntro = () => (
  <section className="py-32 px-6 bg-white">
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl mx-auto text-center"
    >
      <h2 className="text-4xl md:text-6xl font-bold mb-8 text-slate-900 leading-tight">
        We craft <span className="text-indigo-600 italic">high-performance</span> digital products for ambitious brands.
      </h2>
      <p className="text-xl text-slate-500 leading-relaxed">
        Based in the heart of tech innovation, we combine minimalist aesthetics with heavy-duty engineering to solve complex problems.
      </p>
    </motion.div>
  </section>
);

export default WebIntro;
