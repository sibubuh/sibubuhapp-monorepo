import { motion } from "motion/react";
import type { MyprofileSection } from "../../types/sections/myprofile";
import StrapiBlocks from "./StrapiBlocks";
import { Container } from "../ui/Container";

export default function MyprofileSectionComponent({
	title,
	aboutme,
}: MyprofileSection) {
	const items = Array.isArray(aboutme) ? aboutme : [];
	const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;
	return (
		<section className="bg-background">
			<Container className="py-20 md:py-32">
				{title && (
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="mb-16 md:mb-20"
					>
						<h2 className="font-serif text-3xl font-medium text-foreground md:text-5xl">
							{title}
						</h2>
					</motion.div>
				)}

				{items.length === 0 ? (
					<p className="text-center text-muted-foreground">
						No profile data available (items: {items.length})
					</p>
				) : (
					<div className="space-y-16 md:space-y-24">
						{items.map((item: any, index: number) => (
							<motion.div
								key={item?.id || index}
								initial={{ opacity: 0, y: 40 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								className={`flex flex-col items-center gap-8 md:flex-row md:gap-16 ${
									index % 2 === 1 ? "md:flex-row-reverse" : ""
								}`}
							>
								<div className="w-full md:w-1/2">
									<div className="relative aspect-[4/5] overflow-hidden rounded-xl shadow-card md:aspect-square">
										{item?.image?.url ? (
											<img
												src={`${BASE_URL}${item.image.url}`}
												alt={item.title || "Profile image"}
												className="h-full w-full object-cover"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center bg-muted">
												<span className="text-muted-foreground">No image</span>
											</div>
										)}
										<div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
									</div>
								</div>

								<div className="w-full space-y-4 md:w-1/2">
									{item?.title && (
										<h3 className="font-serif text-2xl font-medium text-foreground md:text-3xl">
											{item.title}
										</h3>
									)}
									<div className="prose prose-neutral max-w-none">
										<StrapiBlocks data={item?.content} />
									</div>
								</div>
							</motion.div>
						))}
					</div>
				)}
			</Container>
		</section>
	);
}
