"use client";

import { useState, useEffect } from "react";
import { getFooter } from "../../../services/api";
import type { Footer } from "../../../types/footer";
import StrapiBlocks from "../sections/StrapiBlocks";

const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;

const Footer = () => {
	const [footerData, setFooterData] = useState<Footer | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			const result = await getFooter({ locale: null });
			setFooterData(result);
		};
		fetchData();
	}, []);

	if (!footerData) {
		return (
			<footer className="bg-ink text-ink-foreground">
				<div className="max-w-7xl mx-auto px-6 py-20">
					<div className="h-6 w-32 rounded bg-white/10 animate-pulse" />
					<div className="mt-10 h-px w-full bg-ink-border" />
					<div className="mt-10 flex flex-col gap-3">
						<div className="h-4 w-48 rounded bg-white/10 animate-pulse" />
						<div className="h-4 w-64 rounded bg-white/10 animate-pulse" />
					</div>
				</div>
			</footer>
		);
	}

	const { attributes } = footerData;

	return (
		<footer className="bg-ink text-ink-foreground">
			<div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
				{/* Top row: Logo + Nav */}
				<div className="flex flex-col gap-8 pb-10 border-b border-ink-border md:flex-row md:items-center md:justify-between">
					{attributes.logo?.url && (
						<img
							src={`${BASE_URL}${attributes.logo.url}`}
							alt="Logo"
							className="h-8 w-auto self-start brightness-0 invert opacity-90"
						/>
					)}

					{attributes.links && attributes.links.length > 0 && (
						<nav className="flex flex-wrap items-center gap-x-8 gap-y-3 font-sans">
							{attributes.links.map((link, index) => (
								<a
									key={index}
									href={link.href || "#"}
									className="text-sm text-ink-muted hover:text-ink-foreground transition-colors duration-200"
								>
									{link.title}
								</a>
							))}
						</nav>
					)}
				</div>

				{/* Bottom row: Address + Contacts */}
				<div className="pt-10 grid gap-10 md:grid-cols-2">
					{attributes.address && (
						<div>
							{attributes.address.title && (
								<h2 className="font-sans text-xs font-semibold tracking-wide text-ink-muted">
									{attributes.address.title}
								</h2>
							)}
							<div className="mt-3 max-w-sm text-base leading-relaxed text-ink-foreground/80 [&_p]:mb-0 [&_p]:leading-7">
								<StrapiBlocks data={attributes.address.content} />
							</div>
						</div>
					)}

					{attributes.contacts && attributes.contacts.length > 0 && (
						<div className="md:text-right">
							<h2 className="font-sans text-xs font-semibold tracking-wide text-ink-muted">
								Contact
							</h2>
							<div className="mt-3 flex flex-col gap-2 md:items-end">
								{attributes.contacts.map((contact, index) => (
									<a
										key={index}
										href={contact.anchor?.href || "#"}
										className="text-base text-ink-foreground/80 underline decoration-transparent underline-offset-4 hover:text-ink-foreground hover:decoration-current transition-colors duration-200"
									>
										{contact.title}
									</a>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Bottom bar */}
			{attributes.copyright && (
				<div className="border-t border-ink-border">
					<div className="max-w-7xl mx-auto px-6 py-6">
						<p className="font-sans text-xs text-ink-muted">
							{attributes.copyright}
						</p>
					</div>
				</div>
			)}
		</footer>
	);
};

export default Footer;
