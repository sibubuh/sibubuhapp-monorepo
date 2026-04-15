import { motion } from "motion/react";
import Lottie from "lottie-react";
import type { LottieSection } from "../../types/sections/lottie";

export default function LottieSectionComponent({ lottie }: LottieSection) {
	return (
		<section className="py-24 md:py-32 px-6 bg-white">
			<div className="max-w-7xl mx-auto">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					whileInView={{ opacity: 1, scale: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
					className="flex justify-center"
				>
					<Lottie
						animationData={lottie.url}
						loop={true}
						className="max-w-xl w-full"
					/>
				</motion.div>
			</div>
		</section>
	);
}
