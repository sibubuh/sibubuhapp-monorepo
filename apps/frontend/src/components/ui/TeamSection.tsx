import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSocialMedia } from "../../../services/api";
import type { SocialMedia, SocialMediaItem } from "../../../types/social-media";
import StrapiBlocks from "../sections/StrapiBlocks";

const SocialSection = () => {
	const [active, setActive] = useState<SocialMediaItem | null>(null);
	const [socialData, setSocialData] = useState<SocialMedia | null>(null);
	const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;
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

	return (
		<section className="py-32 px-6 max-w-7xl mx-auto">
			{/* TITLE */}
			<div className="mb-16">
				<h2 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-900">
					{socialData?.title || "My All Publication"}
				</h2>
			</div>

			{/* GRID */}
			{loading ? (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-12">
					{[1, 2, 3].map((i) => (
						<div key={i} className="animate-pulse">
							<div className="aspect-[4/5] bg-gray-200 rounded-2xl mb-6" />
							<div className="h-6 bg-gray-200 rounded w-24" />
							<div className="h-4 bg-gray-200 rounded w-16 mt-1" />
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
					className="grid grid-cols-1 md:grid-cols-3 gap-12"
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
							<div className="aspect-[4/5] bg-gray-100 overflow-hidden rounded-2xl mb-6">
								<img
									src={`${BASE_URL}${item.thumbnail?.url}`}
									className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
									alt={item.name}
								/>
							</div>

							<h3 className="text-xl font-bold">{item.name}</h3>
						</motion.div>
					))}
				</motion.div>
			)}

			{/* 🔥 MODAL */}
			<AnimatePresence>
				{active && (
					<motion.div
						className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setActive(null)}
					>
						<motion.div
							className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							transition={{ duration: 0.3 }}
							onClick={(e) => e.stopPropagation()}
						>
							{/* IMAGE */}
							<div className="aspect-video bg-gray-100">
								<img
									src={`${BASE_URL}${active.thumbnail?.url}`}
									className="w-full h-full object-cover"
									alt={active.name}
								/>
							</div>

							{/* CONTENT */}
							<div className="p-8">
								<h3 className="text-2xl font-bold mb-4">{active.name}</h3>

								{/* RICH TEXT DESCRIPTION */}
								<div className="prose prose-lg max-w-none mb-6">
									<StrapiBlocks data={active.description} />
								</div>

								<a
									href={active.link}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-block px-6 py-3 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-indigo-600 transition-colors"
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
