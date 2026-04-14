import { motion } from 'framer-motion';

const team = [
  { name: 'Kai Zen', role: 'Creative Director' },
  { name: 'Mina Sato', role: 'Lead Engineer' },
  { name: 'Arlo Vance', role: 'UX Strategist' },
];

const TeamSection = () => (
  <section className="py-32 px-6 max-w-7xl mx-auto">
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.15 } }
      }}
      className="grid grid-cols-1 md:grid-cols-3 gap-12"
    >
      {team.map((member, i) => (
        <motion.div
          key={i}
          variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
          className="group cursor-pointer"
        >
          <div className="aspect-[4/5] bg-gray-100 overflow-hidden rounded-2xl mb-6">
            <img
              src={`https://i.pravatar.cc/600?img=${i+20}`}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
            />
          </div>
          <h3 className="text-xl font-bold">{member.name}</h3>
          <p className="text-gray-500 uppercase text-xs tracking-widest mt-1">{member.role}</p>
        </motion.div>
      ))}
    </motion.div>
  </section>
);

export default TeamSection;
