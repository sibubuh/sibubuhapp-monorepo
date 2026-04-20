import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { getSocialMedia } from "../../../services/api";
import type { SocialMedia, SocialMediaItem } from "../../../types/social-media";
import StrapiBlocks from "../sections/StrapiBlocks";

const SocialSection = () => {
	const [active, setActive] = useState<SocialMediaItem | null>(null);
	const [socialData, setSocialData] = useState<SocialMedia | null>(null);
	const [loading, setLoading] = useState(true);

	const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;

	// 📦 Fetch data
	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await getSocialMedia({ locale: null });
				setSocialData(data);
			} catch (error) {
				console.error("Failed to fetch social media:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	// ⌨️ ESC to close
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") setActive(null);
		};
		window.addEventListener("keydown", handleEsc);
		return () => window.removeEventListener("keydown", handleEsc);
	}, []);

	return (
		<section className="py-20 md:py-32 px-4 md:px-6 max-w-7xl mx-auto">
			{/* TITLE */}
			<div className="mb-12 md:mb-16">
				<h2 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900">
					{socialData?.title || "My All Publication"}
				</h2>
			</div>

			{/* GRID */}
			{loading ? (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
					{[1, 2, 3].map((i) => (
						<div key={i} className="animate-pulse">
							<div className="aspect-[4/5] bg-gray-200 rounded-2xl mb-4" />
							<div className="h-5 bg-gray-200 rounded w-24" />
							<div className="h-4 bg-gray-200 rounded w-16 mt-2" />
						</div>
					))}
				</div>
			) : (
				<motion.div
					initial="hidden"
					whileInView="show"
					viewport={{ once: true }}
					variants={{
						hidden: { opacity: 0 },
						show: { opacity: 1, transition: { staggerChildren: 0.15 } },
					}}
					className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
				>
					{socialData?.social.map((item, i) => (
						<motion.div
							key={item.id || i}
							onClick={() => setActive(item)}
							variants={{
								hidden: { y: 20, opacity: 0 },
								show: { y: 0, opacity: 1 },
							}}
							className="group cursor-pointer"
						>
							<div className="aspect-[4/5] bg-gray-100 overflow-hidden rounded-2xl mb-4 md:mb-6">
								<img
									src={`${BASE_URL}${item.thumbnail?.url}`}
									className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
									alt={item.name}
								/>
							</div>

							<h3 className="text-lg md:text-xl font-bold">
								{item.name}
							</h3>
						</motion.div>
					))}
				</motion.div>
			)}

			{/* 🔥 MODAL */}
			<AnimatePresence>
				{active && (
					<motion.div
						className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setActive(null)}
					>
						<motion.div
							onClick={(e) => e.stopPropagation()}
							className="
								relative bg-white w-full md:max-w-4xl
								rounded-t-3xl md:rounded-2xl
								max-h-[90vh] overflow-y-auto shadow-xl
							"
							initial={{ y: "100%", opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: "100%", opacity: 0 }}
							transition={{ duration: 0.35 }}
						>
							{/* CLOSE BUTTON */}
							<button
								onClick={() => setActive(null)}
								className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur hover:bg-neutral-900 hover:text-white transition"
							>
								<X size={20} />
							</button>

							{/* IMAGE */}
							<div className="aspect-video bg-gray-100">
								<img
									src={`${BASE_URL}${active.thumbnail?.url}`}
									className="w-full h-full object-cover"
									alt={active.name}
								/>
							</div>

							{/* CONTENT */}
							<div className="p-5 md:p-8">
								<h3 className="text-xl md:text-2xl font-bold mb-4">
									{active.name}
								</h3>

								<div className="prose prose-sm md:prose-lg max-w-none mb-6">
									<StrapiBlocks data={active.description} />
								</div>

								<a
									href={active.link}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-block w-full md:w-auto text-center px-6 py-3 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-indigo-600 transition-colors"
								>
									Visit Page
								</a>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</section>
	);
};

export default SocialSection;
