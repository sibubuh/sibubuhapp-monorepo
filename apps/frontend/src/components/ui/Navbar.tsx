import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import type { Navbar as NavbarType } from "types/navbar";
import { getHeader } from "services/api";

const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [navbarData, setNavbarData] = useState<NavbarType | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  useEffect(() => {
    const fetchNavbar = async () => {
      try {
        const data = await getHeader({ locale: null });
        setNavbarData(data);
      } catch (error) {
        console.error("Failed to fetch navbar:", error);
      }
    };
    fetchNavbar();
  }, []);

  const menuItems = navbarData?.attributes?.menu || [];
  const logoUrl = navbarData?.attributes?.logo_white?.url;

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

          {/* LOGO */}
          <Link to="/" className="flex items-center">
            {logoUrl ? (
              <img
                src={`${BASE_URL}${logoUrl}`}
                alt="Logo"
                className="h-8 w-auto"
              />
            ) : (
              <span className="text-2xl font-black tracking-tighter text-white">
                SIBUBUH AGENCY<span className="text-indigo-500">.</span>
              </span>
            )}
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex gap-10 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
            {menuItems.map((item, index) => {
              {/*@ts-ignore*/}
              const hasSubmenu = item.sub_menus?.length > 0;
              const isOpen = activeMenu === index;

              return (
                <div key={index} className="relative">
                  {/* Parent */}
                  <button
                    onClick={() => {
                      if (hasSubmenu) {
                        setActiveMenu(isOpen ? null : index);
                      }
                    }}
                    className="hover:text-white transition-colors flex items-center gap-1"
                  >
                    {item.title?.href && !hasSubmenu ? (
                      <Link to={item.title.href}>{item.title.title}</Link>
                    ) : (
                      item.title?.title
                    )}
                  </button>

                  {/* Dropdown */}
                  {hasSubmenu && isOpen && (
                    <div className="absolute left-0 top-full mt-4 w-48 bg-black/90 border border-white/10 rounded-xl p-3 shadow-xl">
                      {/* @ts-ignore */}
                      {item.sub_menus.map((sub, subIndex) => (
                        <Link
                          key={subIndex}
                          to={sub.href}
                          className="block px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
                          onClick={() => setActiveMenu(null)}
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <motion.a
            href="mailto:nchan.bkho@gmail.com"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block bg-white text-black text-[10px] font-black uppercase px-6 py-2 rounded-full tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
          >
            Start Project
          </motion.a>

          {/* HAMBURGER */}
          <button
            onClick={() => setOpen(!open)}
            className="flex flex-col gap-1 md:hidden"
          >
            <span
              className={`w-6 h-[2px] bg-white transition ${
                open ? "rotate-45 translate-y-[5px]" : ""
              }`}
            />
            <span
              className={`w-6 h-[2px] bg-white transition ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-6 h-[2px] bg-white transition ${
                open ? "-rotate-45 -translate-y-[5px]" : ""
              }`}
            />
          </button>
        </div>
      </motion.nav>

      {/* MOBILE MENU */}
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
              {menuItems.map((item, index) => (
                <div key={index} className="flex flex-col gap-2">

                  {/* Parent */}
                  <Link
                    to={item.title?.href || "/"}
                    onClick={() => setOpen(false)}
                  >
                    {item.title?.title}
                  </Link>

                  {/* Submenu */}
                  {/*@ts-ignore*/}
                  {item.sub_menus?.length > 0 && (
                    <div className="flex flex-col gap-2 text-sm text-white/60">
                      {/*@ts-ignore*/}
                      {item.sub_menus.map((sub, subIndex) => (
                        <Link
                          key={subIndex}
                          to={sub.href}
                          onClick={() => setOpen(false)}
                          className="pl-4"
                        >
                          ↳ {sub.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* CTA */}
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
