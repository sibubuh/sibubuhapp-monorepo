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
	const [scrolled, setScrolled] = useState(false);

	// scroll detection
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 40);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

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

	const logoUrl = navbarData?.attributes?.logo_white?.url;

	return (
		<>
			<motion.nav
				initial={{ y: -100 }}
				animate={{ y: 0 }}
				className="fixed top-0 w-full z-[999] px-6 py-4"
			>
				{/* 🔥 ALWAYS READABLE CONTAINER */}
				<div
					className={`max-w-7xl mx-auto flex justify-between items-center rounded-full px-6 py-3 shadow-xl backdrop-blur-md border transition-all duration-300
					${
						scrolled
							? "bg-white border-black/10"
							: "bg-white/80 border-black/10"
					}`}
				>
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
								.SIBUBUH
								<span className="text-indigo-500">.</span>
							</span>
						)}
					</Link>

					{/* 🔥 MENU (FIXED VISIBILITY) */}
					<div className="hidden md:flex gap-3 text-[10px] font-black uppercase tracking-widest">
						{menuItems.map((item, index) => {
							/*@ts-ignore*/
							const hasSubmenu = item.sub_menus?.length > 0;
							const isOpen = activeMenu === index;

							return (
								<div key={index} className="relative">
									<button
										onClick={() => {
											if (hasSubmenu) {
												setActiveMenu(isOpen ? null : index);
											}
										}}
										className="px-5 py-2 rounded-full border border-black/10 bg-white text-black hover:bg-black hover:text-white transition-all"
									>
										{item.title?.href && !hasSubmenu ? (
											<Link to={item.title.href}>
												{item.title.title}
											</Link>
										) : (
											item.title?.title
										)}
									</button>

									{/* DROPDOWN */}
									{hasSubmenu && isOpen && (
										<div className="absolute left-0 top-full mt-4 w-48 bg-white border border-black/10 rounded-xl p-3 shadow-xl">
											{/*@ts-ignore*/}
											{item.sub_menus.map((sub, subIndex) => (
												<Link
													key={subIndex}
													to={sub.href}
													className="block px-3 py-2 text-black/70 hover:text-black hover:bg-black/5 rounded-lg transition"
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

							<a className="bg-black text-white py-3 rounded-full mt-4" href="mailto:nchan.bkho@gmail.com">
								Start Project
							</a>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
};

export default Navbar;
