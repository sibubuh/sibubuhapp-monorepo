import { motion } from "motion/react";
import type { PartnersSection } from "../../types/sections/partners";

export default function PartnersSectionComponent({
	title,
	image,
	description,
	link,
}: PartnersSection) {
	return (
		<section className="bg-background py-24 md:py-32">
			<div className="mx-auto max-w-7xl px-6">
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
					className="mb-16 text-center"
				>
					<h2 className="mb-6 font-serif text-4xl font-medium text-foreground md:text-6xl">
						{title}
					</h2>
					<img
						src={image.url}
						alt={title}
						className="mx-auto mb-8 max-h-32 object-contain"
					/>
					<p className="mx-auto mb-8 max-w-3xl text-xl text-muted-foreground">
						{description}
					</p>
					{link && (
						<a
							href={link.href || "#"}
							className="inline-block rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
						>
							{link.title}
						</a>
					)}
				</motion.div>
			</div>
		</section>
	);
}
