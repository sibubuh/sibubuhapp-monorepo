//"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "@tanstack/react-router";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="fixed top-0 w-full z-[999] px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 shadow-2xl">

          {/* Logo */}
          <Link to="/" className="text-2xl font-black tracking-tighter text-white">
            NEXUS<span className="text-indigo-500">.</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-10 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
            <Link to="/" className="hover:text-white transition-colors">Work</Link>
            <Link to="/" className="hover:text-white transition-colors">About</Link>
            <Link to="/" className="hover:text-white transition-colors">Services</Link>
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block bg-white text-black text-[10px] font-black uppercase px-6 py-2 rounded-full tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
          >
            Start Project
          </motion.button>

          {/* Hamburger (NOW ALWAYS VISIBLE) */}
          <button
            onClick={() => setOpen(!open)}
            className="flex flex-col gap-1 md:hidden"
          >
            <span className={`w-6 h-[2px] bg-white transition ${open ? "rotate-45 translate-y-[5px]" : ""}`} />
            <span className={`w-6 h-[2px] bg-white transition ${open ? "opacity-0" : ""}`} />
            <span className={`w-6 h-[2px] bg-white transition ${open ? "-rotate-45 -translate-y-[5px]" : ""}`} />
          </button>
        </div>
      </motion.nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {open && (
          <>
            {/* BACKDROP */}
            <motion.div
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998]"
            />

            {/* MENU */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-black/90 border border-white/10 rounded-2xl p-6 flex flex-col gap-6 text-center text-white uppercase tracking-widest font-bold z-[999]"
            >
              <Link to="/" onClick={() => setOpen(false)}>Work</Link>
              <Link to="/" onClick={() => setOpen(false)}>About</Link>
              <Link to="/" onClick={() => setOpen(false)}>Services</Link>

              <button className="bg-white text-black py-3 rounded-full mt-4">
                Start Project
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
