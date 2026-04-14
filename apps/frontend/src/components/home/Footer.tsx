'use client';

const Footer = () => (
  <footer className="py-12 border-t border-slate-100 text-center">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
      <p className="font-bold text-black tracking-widest">NEXUS STUDIO.</p>
      <div className="flex gap-8 my-6 md:my-0 uppercase tracking-[0.2em] font-medium">
        <a href="#" className="hover:text-indigo-600">Twitter</a>
        <a href="#" className="hover:text-indigo-600">LinkedIn</a>
        <a href="#" className="hover:text-indigo-600">Dribbble</a>
      </div>
      <p>© 2026 ALL RIGHTS RESERVED.</p>
    </div>
  </footer>
);

export default Footer;
