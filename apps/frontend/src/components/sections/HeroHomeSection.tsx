import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { HeroHomeSection } from "../../types/sections/hero-home";

export default function HeroHomeSectionComponent({ items }: HeroHomeSection) {
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		if (items.length <= 1) return;
		const timer = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % items.length);
		}, 7000);
		return () => clearInterval(timer);
	}, [items.length]);

	if (!items || items.length === 0) return null;

	const currentItem = items[currentIndex];

	return (
		<section className="relative h-screen bg-neutral-950 overflow-hidden">
			<AnimatePresence mode="wait">
				<motion.div
					key={currentIndex}
					initial={{ opacity: 0, scale: 1.1 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.9 }}
					transition={{ duration: 1.5 }}
					className="absolute inset-0"
				>
					<img
						src={currentItem.image.url}
						className="w-full h-full object-cover opacity-40"
						alt={currentItem.title}
					/>
					<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
						<motion.h1
							initial={{ y: 40, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.4 }}
							className="text-7xl md:text-9xl font-black text-white tracking-tighter"
						>
							{currentItem.title}
						</motion.h1>
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.6 }}
							className="text-xl text-neutral-400 mt-4 tracking-widest uppercase"
						>
							{currentItem.content_title}
						</motion.p>
						{currentItem.link && (
							<motion.a
								href={currentItem.link.link}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.8 }}
								className="mt-8 bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-colors"
							>
								{currentItem.link.label}
							</motion.a>
						)}
					</div>
				</motion.div>
			</AnimatePresence>

			{items.length > 1 && (
				<div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
					{items.map((_, index) => (
						<button
							key={index}
							onClick={() => setCurrentIndex(index)}
							className={`w-2 h-2 rounded-full transition-colors ${
								index === currentIndex ? "bg-white" : "bg-white/30"
							}`}
						/>
					))}
				</div>
			)}
		</section>
	);
}
