import { useEffect, useState, type ReactNode, type SyntheticEvent } from "react";
import { supportsHtmlInCanvas, VHS } from "../canvasui/VHS";

/**
 * API html-in-canvas (Chrome 157+) tidak melukis resource cross-origin ke
 * dalam canvas. Akibatnya <img> dari Strapi hilang dari hero walau teksnya
 * tetap tampil. Pasang crossOrigin="anonymous" pada <img> di dalam <VHSHero>
 * supaya gambarnya CORS-clean dan ikut kena efek.
 *
 * Handler ini jaring pengaman: kalau host gambar ternyata tidak mengirim
 * header Access-Control-Allow-Origin, muat ulang tanpa crossOrigin supaya
 * gambarnya tetap tampil (hanya saja tidak ikut terolah efek VHS).
 */
export function retryImageWithoutCors(event: SyntheticEvent<HTMLImageElement>) {
	const img = event.currentTarget;
	if (!img.crossOrigin) return;
	const { src } = img;
	img.removeAttribute("crossorigin");
	img.src = src;
}

interface VHSHeroProps {
	/** Kelas untuk wrapper VHS. Harus membawa tinggi hero-nya, mis. "h-[50vh] md:h-[60vh]". */
	className?: string;
	children: ReactNode;
}

/**
 * Preset efek VHS untuk hero section.
 *
 * Nilainya sengaja ditulis eksplisit (sama dengan default canvasui) supaya
 * tuning intensitas cukup dilakukan di satu tempat ini.
 *
 * Browser tanpa html-in-canvas (Safari, Firefox, dan semua browser mobile —
 * lihat isHtmlInCanvasBlocked di canvasui/VHS.tsx yang memblokir Android)
 * tidak menampilkan apa pun dari shader WebGL-nya, tapi tetap membayar loop
 * requestAnimationFrame 60fps. Di sana kita lepas <VHS> dan pakai overlay CSS
 * (kelas .vhs-fx-* di src/styles/global.css) sebagai gantinya.
 *
 * Deteksinya dijalankan di useEffect, bukan saat render, supaya markup render
 * pertama di client identik dengan hasil SSR — kalau tidak, hidrasi mismatch.
 * Efek sampingnya: browser yang mendukung tidak pernah berganti cabang sama
 * sekali, jadi tidak ada remount sia-sia di jalur yang paling umum.
 */
export function VHSHero({ className, children }: VHSHeroProps) {
	const [cssFallback, setCssFallback] = useState(false);

	useEffect(() => {
		setCssFallback(!supportsHtmlInCanvas());
	}, []);

	if (cssFallback) {
		return (
			<div className={`vhs-fx ${className ?? ""}`}>
				<div className="vhs-fx-content">{children}</div>
				<div className="vhs-fx-layer vhs-fx-scanlines" aria-hidden="true" />
				<div className="vhs-fx-layer vhs-fx-grain" aria-hidden="true" />
				<div className="vhs-fx-layer vhs-fx-roll" aria-hidden="true" />
			</div>
		);
	}

	return (
		<VHS
			className={className}
			speed={0.5}
			wave={1}
			jitter={0.25}
			crease={0.1}
			switching={0.05}
			switchingHeight={0.02}
			bloom={0.4}
			aberration={2}
			acBeat={1}
			grain={0.1}
			scanlines={0.1}
			vignette={0}
			barrel={0}
			saturation={1}
			exposure={1}
		>
			{children}
		</VHS>
	);
}
