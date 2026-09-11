import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import type { Navbar as NavbarType } from "types/navbar";
import { getHeader } from "services/api";
import { useTheme } from "../../hooks/useTheme";
import ThemeToggle from "./ThemeToggle";

const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;

const Navbar = () => {
	const [open, setOpen] = useState(false);
	const [navbarData, setNavbarData] = useState<NavbarType | null>(null);
	const [activeMenu, setActiveMenu] = useState<number | null>(null);
	const { theme } = useTheme();

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

	const isDark = theme === "dark";
	const logoUrl = navbarData?.attributes?.[isDark ? "logo_white" : "logo_black"]?.url;

	return (
		<>
			{/* NAVBAR */}
			<motion.nav
				initial={{ y: -100 }}
				animate={{ y: 0 }}
				transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
				className="fixed top-0 w-full z-[999] bg-background/85 backdrop-blur-md border-b border-border"
			>
				<div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

					{/* LOGO */}
					<Link to="/" className="flex items-center" aria-label="Sibubuh — home">
						{logoUrl ? (
							<img
								src={`${BASE_URL}${logoUrl}`}
								alt="Logo"
								className="h-8 w-auto"
							/>
						) : (
							<span className="font-sans text-xl font-semibold tracking-tight text-foreground">
								SIBUBUH<span className="text-primary">.</span>
							</span>
						)}
					</Link>

					{/* DESKTOP MENU */}
					<div className="hidden md:flex items-center gap-1 font-sans text-sm font-medium">
						{menuItems.map((item, index) => {
							/*@ts-ignore*/
							const hasSubmenu = item.sub_menus?.length > 0;

							return (
								<div key={index} className="relative">
									{/* LINK (NO SUBMENU) */}
									{!hasSubmenu ? (
										<Link
											to={item.title?.href || "/"}
											className="px-4 py-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
										>
											{item.title?.title}
										</Link>
									) : (
										/* HOVER BUTTON (WITH SUBMENU) */
										<div
											onMouseEnter={() => setActiveMenu(index)}
											onMouseLeave={() => setActiveMenu(null)}
											className="relative"
										>
											<button
												type="button"
												className="px-4 py-2 rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
											>
												{item.title?.title}
											</button>

											{/* DROPDOWN */}
											<AnimatePresence>
												{activeMenu === index && (
													<motion.div
														initial={{ opacity: 0, y: 8 }}
														animate={{ opacity: 1, y: 0 }}
														exit={{ opacity: 0, y: 8 }}
														transition={{ duration: 0.18 }}
														className="absolute left-0 top-full mt-2 w-52 bg-card border border-border rounded-xl p-2 shadow-card"
													>
														{/*@ts-ignore*/}
														{item.sub_menus.map((sub, subIndex) => (
															<Link
																key={subIndex}
																to={sub.href}
																className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
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

					{/* CTA + THEME TOGGLE */}
					<div className="hidden md:flex items-center gap-3">
						<motion.a
							href="mailto:nchan.bkho@gmail.com"
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
							className="bg-foreground text-background font-sans text-sm font-medium px-5 py-2 rounded-full hover:bg-ink hover:text-ink-foreground transition-colors"
						>
							Start Project
						</motion.a>
						<ThemeToggle />
					</div>

					{/* MOBILE: HAMBURGER + THEME TOGGLE */}
					<div className="flex items-center gap-2 md:hidden">
						<button
							type="button"
							onClick={() => setOpen(!open)}
							aria-label="Toggle menu"
							aria-expanded={open}
							className="flex flex-col gap-1.5 p-2"
						>
							<span className="w-6 h-0.5 bg-foreground" />
							<span className="w-6 h-0.5 bg-foreground" />
							<span className="w-6 h-0.5 bg-foreground" />
						</button>
						<ThemeToggle />
					</div>
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
							className="fixed inset-0 bg-foreground/40 z-[998]"
						/>

						<motion.div
							initial={{ y: -24, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: -24, opacity: 0 }}
							className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-card border border-border rounded-2xl p-6 flex flex-col gap-1 text-center font-sans z-[999] shadow-card"
						>
							{menuItems.map((item, index) => (
								<Link
									key={index}
									to={item.title?.href || "/"}
									onClick={() => setOpen(false)}
									className="py-3 text-base font-medium text-foreground/80 hover:text-foreground rounded-lg hover:bg-accent transition-colors"
								>
									{item.title?.title}
								</Link>
							))}

							<a
								href="mailto:nchan.bkho@gmail.com"
								onClick={() => setOpen(false)}
								className="mt-3 bg-foreground text-background font-medium py-3 rounded-full hover:bg-ink hover:text-ink-foreground transition-colors"
							>
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
