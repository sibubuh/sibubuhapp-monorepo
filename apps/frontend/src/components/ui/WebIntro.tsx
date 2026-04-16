import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getWebIntro } from "../../../services/api";
import StrapiBlocks from "../sections/StrapiBlocks";

const WebIntro = () => {
	const [data, setData] = useState<{
		title: unknown;
		description: unknown;
	} | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			const result = await getWebIntro({ locale: null });
			setData(result);
		};
		fetchData();
	}, []);

	if (!data) return null;

	return (
		<section className="py-32 px-6 bg-white">
			<motion.div
				initial={{ opacity: 0, y: 50 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.8 }}
				className="max-w-4xl mx-auto text-center"
			>
				<div className="text-4xl md:text-6xl font-bold mb-8 text-slate-900 leading-tight [&_p]:mb-0 [&_p]:leading-tight">
					<StrapiBlocks data={data.title} />
				</div>
				<div className="text-xl text-slate-500 leading-relaxed [&_p]:mb-0 [&_p]:leading-relaxed">
					<StrapiBlocks data={data.description} />
				</div>
			</motion.div>
		</section>
	);
};

export default WebIntro;
