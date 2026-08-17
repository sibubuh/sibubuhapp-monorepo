import { motion } from "motion/react";
import type { CompanyIntroSection } from "../../types/sections/company-intro";
import { Container } from "../ui/Container";

export default function CompanyIntroSectionComponent({
	title,
	secondary_title,
	description,
	link,
	image,
}: CompanyIntroSection) {
	return (
		<section className="bg-background py-24 md:py-32">
			<Container>
				<div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
					>
						<h2 className="mb-4 font-serif text-4xl font-medium text-foreground md:text-5xl">
							{title}
						</h2>
						{secondary_title && (
							<p className="mb-6 text-2xl font-medium text-primary">{secondary_title}</p>
						)}
						<p className="mb-8 text-lg leading-relaxed text-muted-foreground">
							{description}
						</p>
						{link && (
							<a
								href={link.href || "#"}
								className="inline-flex items-center rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
							>
								{link.title}
							</a>
						)}
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="relative"
					>
						<div className="aspect-[4/3] overflow-hidden rounded-xl shadow-card">
							<img
								src={image.url}
								alt={title}
								className="h-full w-full object-cover"
							/>
						</div>
					</motion.div>
				</div>
			</Container>
		</section>
	);
}
