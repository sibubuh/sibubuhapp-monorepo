import { motion } from "framer-motion";
import type { MyprofileSection } from "../../types/sections/myprofile";
import StrapiBlocks from "./StrapiBlocks";

export default function MyprofileSectionComponent({
	title,
	aboutme,
}: MyprofileSection) {
	const items = Array.isArray(aboutme) ? aboutme : [];
  const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;
	return (
		<section className="py-20 md:py-32 px-4 md:px-6 max-w-7xl mx-auto">
			{title && (
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="mb-16 md:mb-20"
				>
					<h2 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900">
						{title}
					</h2>
				</motion.div>
			)}

			{items.length === 0 ? (
				<p className="text-center text-neutral-400">
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
							className={`flex flex-col md:flex-row gap-8 md:gap-16 items-center ${
								index % 2 === 1 ? "md:flex-row-reverse" : ""
							}`}
						>
							<div className="w-full md:w-1/2">
								<div className="relative aspect-[4/5] md:aspect-square rounded-2xl md:rounded-3xl overflow-hidden shadow-xl">
									{item?.image?.url ? (
										<img
											src={`${BASE_URL}${item.image.url}`}
											alt={item.title || "Profile image"}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full bg-gray-200 flex items-center justify-center">
											<span className="text-gray-400">No image</span>
										</div>
									)}
									<div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
								</div>
							</div>

							<div className="w-full md:w-1/2 space-y-4">
								{item?.title && (
									<h3 className="text-2xl md:text-3xl font-bold text-neutral-900">
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
		</section>
	);
}
