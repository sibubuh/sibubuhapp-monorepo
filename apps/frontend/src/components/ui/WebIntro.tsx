import { useState, useEffect } from "react";
import { getWebIntro } from "../../../services/api";
import TextAnimation from "./staggerText";

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
		<section className="border-y border-border bg-background px-6 py-20 md:py-28">
			<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:gap-16">
				<h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-balance text-foreground sm:text-4xl lg:col-span-6 lg:text-5xl">
					<TextAnimation>{extractPlainText(data.title)}</TextAnimation>
				</h2>
				<p className="max-w-2xl font-sans text-lg leading-relaxed text-muted-foreground lg:col-span-6 lg:text-xl">
					<TextAnimation delay={0.2}>
						{extractPlainText(data.description)}
					</TextAnimation>
				</p>
			</div>
		</section>
	);
};

export default WebIntro;
