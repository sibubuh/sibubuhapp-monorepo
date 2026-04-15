import { useEffect } from "react";
import { SITE_NAME } from "../../../config/metadata";

interface SeoMetaProps {
	title?: string;
	description?: string;
	keywords?: string;
	image?: string;
	noIndex?: boolean;
}

export default function SeoMeta({
	title,
	description,
	keywords,
	image,
	noIndex = false,
}: SeoMetaProps) {
	const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

	useEffect(() => {
		document.title = fullTitle;
	}, [fullTitle]);

	return (
		<>
			<title>{fullTitle}</title>
			{description && <meta name="description" content={description} />}
			{keywords && <meta name="keywords" content={keywords} />}
			<meta property="og:title" content={fullTitle} />
			{description && <meta property="og:description" content={description} />}
			{image && <meta property="og:image" content={image} />}
			<meta property="og:type" content="website" />
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={fullTitle} />
			{description && <meta name="twitter:description" content={description} />}
			{image && <meta name="twitter:image" content={image} />}
			{noIndex && <meta name="robots" content="noindex, nofollow" />}
		</>
	);
}
