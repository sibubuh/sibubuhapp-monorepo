import { motion } from "motion/react";
import type { HeroPageSection } from "../../types/sections/hero-page";
import StrapiBlocks from "./StrapiBlocks";

const baseURL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;

export default function HeroPageSectionComponent({
	heropage,
}: HeroPageSection) {
	if (!heropage || heropage.length === 0) return null;

	const item = heropage[0];
	return (
		<section className="relative h-[50vh] md:h-[60vh] bg-neutral-950 overflow-hidden">
			<img
				src={baseURL + item.image.url}
				className="absolute inset-0 w-full h-full object-cover opacity-60"
				alt={item.title}
			/>
			<div className="absolute inset-0 flex items-center justify-center">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="text-center text-white max-w-4xl px-6"
				>
					<h1 className="text-5xl md:text-7xl font-black tracking-tight mb-2">
						{item.title}
					</h1>
					<StrapiBlocks
						data={item.content}
						className="text-lg text-white"
					/>
				</motion.div>
			</div>
		</section>
	);
}
