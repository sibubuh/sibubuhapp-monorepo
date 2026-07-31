import { useState, useEffect } from "react";
import { getWebIntro } from "../../../services/api";
import TextAnimation from "./staggerText";
import { Camera, Video, FileText, Code, PenTool, Mic } from "lucide-react";
import { motion } from "framer-motion";

function extractPlainText(content: unknown): string {
	if (!content) return "";
	if (typeof content === "string")
		return content.replace(/<[^>]*>/g, "").trim();
	if (Array.isArray(content)) {
		return content.map(extractPlainText).join(" ");
	}
	if (typeof content === "object" && "children" in content) {
		return extractPlainText((content as Record<string, unknown>).children);
	}
	if (typeof content === "object" && "text" in content) {
		return ((content as Record<string, unknown>).text as string) || "";
	}
	return "";
}

const floatingIcons = [
	{
		icon: Camera,
		position: "top-10 left-[10%] md:left-[15%]",
		animate: { x: [0, 6, 0], y: [0, -8, 0] },
		delay: 0,
	},
	{
		icon: Video,
		position: "top-10 right-[10%] md:right-[15%]",
		animate: { x: [0, -4, 0], y: [0, -10, 0] },
		delay: 0.15,
	},
	{
		icon: FileText,
		position: "bottom-10 left-[10%] md:left-[15%]",
		animate: { x: [0, 8, 0], y: [0, 6, 0] },
		delay: 0.3,
	},
	{
		icon: Code,
		position: "bottom-10 right-[10%] md:right-[15%]",
		animate: { x: [0, -6, 0], y: [0, 4, 0] },
		delay: 0.45,
	},
	{
		icon: PenTool,
		position: "top-1/3 left-[5%] md:left-[8%]",
		animate: { x: [0, 4, 0], y: [0, -6, 6, 0] },
		delay: 0.6,
	},
	{
		icon: Mic,
		position: "top-2/3 right-[5%] md:right-[8%]",
		animate: { x: [0, -4, 0], y: [0, 8, -4, 0] },
		delay: 0.75,
	},
];

const EASE = [0.22, 1, 0.36, 1] as const;

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
		<section className="relative py-32 px-6 bg-white dark:bg-zinc-950 overflow-hidden">
			<div
				className="absolute inset-0 opacity-[0.04] pointer-events-none"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
				}}
			/>
			{floatingIcons.map(({ icon: Icon, position, animate, delay }) => (
				<motion.div
					key={position}
					className={`absolute ${position}`}
					initial={{ opacity: 0, scale: 0.6 }}
					whileInView={{ opacity: 1, scale: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.7, ease: EASE, delay }}
				>
					<motion.div
						animate={animate}
						transition={{
							duration: 4,
							repeat: Infinity,
							repeatType: "reverse",
							ease: EASE,
							delay,
						}}
					>
						<Icon className="w-8 h-8 md:w-10 md:h-10 text-slate-900/20 dark:text-white/10" />
					</motion.div>
				</motion.div>
			))}

			<div className="max-w-4xl mx-auto text-center">
				<h2 className="text-4xl md:text-6xl font-bold mb-8 text-slate-900 dark:text-zinc-100 leading-tight">
					<TextAnimation>{extractPlainText(data.title)}</TextAnimation>
				</h2>
				<p className="text-xl text-slate-500 dark:text-zinc-400 leading-relaxed">
					<TextAnimation delay={0.2}>{extractPlainText(data.description)}</TextAnimation>
				</p>
			</div>
		</section>
	);
};

export default WebIntro;
