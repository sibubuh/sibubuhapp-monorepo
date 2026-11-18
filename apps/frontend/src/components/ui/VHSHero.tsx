import {
	lazy,
	Suspense,
	useEffect,
	useState,
	type ReactNode,
	type SyntheticEvent,
} from "react";
import { supportsHtmlInCanvas } from "../canvasui/supportsHtmlInCanvas";

/**
 * The WebGL module carries its own shaders and a 60fps render loop, and it was
 * the biggest single contributor to the page's 863ms of total blocking time.
 * Loading it on demand keeps it off the critical path: the CSS fallback below
 * renders immediately and the canvas swaps in once its chunk arrives.
 */
const VHS = lazy(() =>
	import("../canvasui/VHS").then((m) => ({ default: m.VHS })),
);

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
 * Efek VHS versi CSS murni (kelas .vhs-fx-* di src/styles/global.css). Dipakai
 * sebagai fallback <VHSHero> sekaligus sebagai efek tetap di hero homepage,
 * yang tidak lagi memuat WebGL sama sekali.
 */
export function CssVhs({ className, children }: VHSHeroProps) {
	return (
		<div className={`vhs-fx ${className ?? ""}`}>
			<div className="vhs-fx-content">{children}</div>
			<div className="vhs-fx-layer vhs-fx-scanlines" aria-hidden="true" />
			<div className="vhs-fx-layer vhs-fx-grain" aria-hidden="true" />
			<div className="vhs-fx-layer vhs-fx-roll" aria-hidden="true" />
		</div>
	);
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

	const fallback = <CssVhs className={className}>{children}</CssVhs>;

	if (cssFallback) return fallback;

	return (
		<Suspense fallback={fallback}>
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
		</Suspense>
	);
}
