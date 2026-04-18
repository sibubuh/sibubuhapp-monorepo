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

	const menuItems = navbarData?.attributes?.menu || [
		{ title: { title: "Projects", href: "/projects" } },
	];

	const logoUrl = navbarData?.attributes?.logo_black?.url;

	return (
		<>
			{/* NAVBAR */}
			<motion.nav
				initial={{ y: -100 }}
				animate={{ y: 0 }}
				className="fixed top-0 w-full z-[999] px-6 py-4"
			>
				<div className="max-w-7xl mx-auto flex justify-between items-center bg-white/90 border border-black/10 rounded-full px-6 py-3 shadow-xl backdrop-blur-md">

					{/* LOGO */}
					<Link to="/" className="flex items-center">
						{logoUrl ? (
							<img
								src={`${BASE_URL}${logoUrl}`}
								alt="Logo"
								className="h-8 w-auto"
							/>
						) : (
							<span className="text-2xl font-black tracking-tighter text-black">
								SIBUBUH<span className="text-indigo-500">.</span>
							</span>
						)}
					</Link>

					{/* 🔥 DESKTOP MENU */}
					<div className="hidden md:flex gap-3 text-[10px] font-black uppercase tracking-widest">
						{menuItems.map((item, index) => {
							/*@ts-ignore*/
							const hasSubmenu = item.sub_menus?.length > 0;

							return (
								<div key={index} className="relative">
									{/* ✅ LINK (NO SUBMENU) */}
									{!hasSubmenu ? (
										<Link
											to={item.title?.href || "/"}
											className="px-5 py-2 rounded-full border border-black/10 bg-white text-black hover:bg-black hover:text-white transition-all duration-200"
										>
											{item.title?.title}
										</Link>
									) : (
										/* ✅ HOVER BUTTON (WITH SUBMENU) */
										<div
											onMouseEnter={() => setActiveMenu(index)}
											onMouseLeave={() => setActiveMenu(null)}
											className="relative"
										>
											<div className="px-5 py-2 rounded-full border border-black/10 bg-white text-black hover:bg-black hover:text-white transition-all duration-200 cursor-pointer">
												{item.title?.title}
											</div>

											{/* DROPDOWN */}
											<AnimatePresence>
												{activeMenu === index && (
													<motion.div
														initial={{ opacity: 0, y: 10 }}
														animate={{ opacity: 1, y: 0 }}
														exit={{ opacity: 0, y: 10 }}
														transition={{ duration: 0.2 }}
														className="absolute left-0 top-full mt-3 w-48 bg-white border border-black/10 rounded-xl p-3 shadow-xl"
													>
														{/*@ts-ignore*/}
														{item.sub_menus.map((sub, subIndex) => (
															<Link
																key={subIndex}
																to={sub.href}
																className="block px-3 py-2 text-black/70 hover:text-black hover:bg-black/5 rounded-lg transition"
															>
																{sub.title}
															</Link>
														))}
													</motion.div>
												)}
											</AnimatePresence>
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
						className="hidden md:block bg-black text-white text-[10px] font-black uppercase px-6 py-2 rounded-full tracking-widest hover:bg-indigo-600 transition-all"
					>
						Start Project
					</motion.a>

					{/* MOBILE BUTTON */}
					<button
						onClick={() => setOpen(!open)}
						className="flex flex-col gap-1 md:hidden"
					>
						<span className="w-6 h-[2px] bg-black" />
						<span className="w-6 h-[2px] bg-black" />
						<span className="w-6 h-[2px] bg-black" />
					</button>
				</div>
			</motion.nav>

			{/* MOBILE MENU */}
			<AnimatePresence>
				{open && (
					<>
						<motion.div
							onClick={() => setOpen(false)}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 bg-black/50 z-[998]"
						/>

						<motion.div
							initial={{ y: -50, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: -50, opacity: 0 }}
							className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white border border-black/10 rounded-2xl p-6 flex flex-col gap-6 text-center text-black uppercase tracking-widest font-bold z-[999]"
						>
							{menuItems.map((item, index) => (
								<Link
									key={index}
									to={item.title?.href || "/"}
									onClick={() => setOpen(false)}
								>
									{item.title?.title}
								</Link>
							))}

							<button className="bg-black text-white py-3 rounded-full mt-4">
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
