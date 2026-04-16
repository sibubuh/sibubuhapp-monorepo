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
			<footer className="bg-[#080C14] border-t border-white/5 py-16 text-center">
				<div className="max-w-7xl mx-auto px-6 text-slate-600 text-sm animate-pulse">
					<p>Loading...</p>
				</div>
			</footer>
		);
	}

	const { attributes } = footerData;

	return (
		<footer className="bg-[#080C14] border-t border-white/5">
			{/* Main footer content */}
			<div className="max-w-7xl mx-auto px-6 py-16">

				{/* Top row: Logo + Nav + Copyright */}
				<div className="flex flex-col md:flex-row justify-between items-center gap-8 pb-10 border-b border-white/5">
					{/* Logo */}
					{attributes.logo?.url && (
						<img
							src={`${BASE_URL}${attributes.logo.url}`}
							alt="Logo"
							className="h-7 brightness-0 invert opacity-50 hover:opacity-80 transition-opacity duration-300"
						/>
					)}

					{/* Nav Links */}
					{attributes.links && attributes.links.length > 0 && (
						<nav className="flex items-center gap-1">
							{attributes.links.map((link, index) => (
								<a
									key={index}
									href={link.href || "#"}
									className="px-4 py-2 text-xs text-slate-500 hover:text-slate-200 uppercase tracking-[0.18em] font-medium transition-colors duration-200 rounded-md hover:bg-white/5"
								>
									{link.title}
								</a>
							))}
						</nav>
					)}

					{/* Copyright */}
					{attributes.copyright && (
						<p className="text-xs text-slate-600 tracking-wide">
							{attributes.copyright}
						</p>
					)}
				</div>

				{/* Bottom row: Address + Contacts */}
				<div className="pt-10 flex flex-col md:flex-row justify-between items-start gap-10">

					{/* Address */}
					{attributes.address && (
						<div className="text-left">
							{attributes.address.title && (
								<p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-semibold mb-3">
									{attributes.address.title}
								</p>
							)}
							<div className="text-sm text-slate-500 leading-relaxed [&_p]:mb-0 [&_p]:leading-7">
								<StrapiBlocks data={attributes.address.content} />
							</div>
						</div>
					)}

					{/* Contacts */}
					{attributes.contacts && attributes.contacts.length > 0 && (
						<div className="text-left md:text-right flex flex-col gap-3">
							<p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-semibold">
								Contact
							</p>
							{attributes.contacts.map((contact, index) => (
								<a
									key={index}
									href={contact.anchor?.href || "#"}
									className="text-sm text-slate-500 hover:text-indigo-400 transition-colors duration-200"
								>
									{contact.title}
								</a>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Bottom bar */}
			<div className="border-t border-white/5 py-4">
				<p className="text-center text-[10px] text-slate-700 tracking-[0.25em] uppercase">
					Built with care
				</p>
			</div>
		</footer>
	);
};

export default Footer;
