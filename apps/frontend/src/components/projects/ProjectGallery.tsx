import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { resolveStrapiUrl, strapiImage } from "../../../libs/strapi-image";
import type { ImageType } from "../../../types/image";

interface ProjectGalleryProps {
	images: ImageType[];
	/** Fallback alt text when the upload has no alternativeText of its own. */
	title?: string;
}

/** Masonry columns are fluid, so the thumbnail slot is a fraction of the viewport. */
const THUMB_SIZES = "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw";

/** Wraps around both ends so arrow navigation never lands outside the list. */
export function wrapIndex(index: number, length: number): number {
	if (length <= 0) return 0;
	return ((index % length) + length) % length;
}

export default function ProjectGallery({ images, title }: ProjectGalleryProps) {
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	const [loaded, setLoaded] = useState(false);
	const reduceMotion = useReducedMotion();
	const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const dialogRef = useRef<HTMLDivElement>(null);
	const closeRef = useRef<HTMLButtonElement>(null);

	const isOpen = openIndex !== null;

	const open = useCallback((index: number) => {
		setLoaded(false);
		setOpenIndex(index);
	}, []);

	const close = useCallback(() => {
		setOpenIndex(null);
		if (openIndex !== null) thumbRefs.current[openIndex]?.focus();
	}, [openIndex]);

	const step = useCallback(
		(delta: number) => {
			setLoaded(false);
			setOpenIndex((current) =>
				current === null ? null : wrapIndex(current + delta, images.length),
			);
		},
		[images.length],
	);

	useEffect(() => {
		if (!isOpen) return;

		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") return close();
			if (event.key === "ArrowRight") return step(1);
			if (event.key === "ArrowLeft") return step(-1);
			if (event.key !== "Tab") return;

			// Keep tabbing inside the dialog; the page behind it is inert to the user.
			const focusables = dialogRef.current?.querySelectorAll<HTMLElement>("button");
			if (!focusables?.length) return;
			const first = focusables[0];
			const last = focusables[focusables.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};

		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [isOpen, close, step]);

	useEffect(() => {
		if (!isOpen) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		closeRef.current?.focus();

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [isOpen]);

	// Warm the neighbours so arrow navigation doesn't show the spinner.
	useEffect(() => {
		if (openIndex === null || images.length < 2) return;

		for (const delta of [1, -1]) {
			const neighbour = strapiImage(images[wrapIndex(openIndex + delta, images.length)]);
			if (!neighbour) continue;
			const preload = new Image();
			if (neighbour.srcSet) preload.srcset = neighbour.srcSet;
			preload.sizes = "90vw";
			preload.src = neighbour.src;
		}
	}, [openIndex, images]);

	if (!images.length) return null;

	const active = openIndex === null ? null : images[openIndex];
	const activeImage = strapiImage(active);

	return (
		<>
			<div className="columns-2 gap-3 md:columns-3 lg:columns-4">
				{images.map((image, index) => {
					const responsive = strapiImage(image);
					if (!responsive) return null;
					const alt = image.alt || title || "";

					return (
						<motion.div
							key={image.id || responsive.src}
							className="mb-3 break-inside-avoid"
							initial={reduceMotion ? false : { opacity: 0, y: 24 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.2 }}
							transition={{
								duration: 0.6,
								ease: [0.22, 1, 0.36, 1],
								delay: Math.min(index, 8) * 0.05,
							}}
						>
							<button
								type="button"
								ref={(node) => {
									thumbRefs.current[index] = node;
								}}
								onClick={() => open(index)}
								aria-label={alt ? `Perbesar ${alt}` : `Perbesar foto ${index + 1}`}
								className="group relative block w-full cursor-zoom-in overflow-hidden rounded-xl bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								<img
									src={responsive.src}
									srcSet={responsive.srcSet}
									sizes={THUMB_SIZES}
									width={responsive.width}
									height={responsive.height}
									alt={alt}
									loading="lazy"
									decoding="async"
									className="block h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
								/>
								<span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/35 group-focus-visible:bg-black/35">
									<ZoomIn className="h-6 w-6 scale-75 text-white opacity-0 transition duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100" />
								</span>
							</button>
						</motion.div>
					);
				})}
			</div>

			{isOpen &&
				activeImage &&
				createPortal(
					<div
						ref={dialogRef}
						role="dialog"
						aria-modal="true"
						aria-label="Galeri project"
						onClick={close}
						className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
					>
						<button
							type="button"
							ref={closeRef}
							onClick={close}
							aria-label="Tutup galeri"
							className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
						>
							<X className="h-4 w-4" />
						</button>

						<span className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs tracking-[0.12em] text-white/60">
							{String(openIndex + 1).padStart(2, "0")} /{" "}
							{String(images.length).padStart(2, "0")}
						</span>

						{images.length > 1 && (
							<button
								type="button"
								onClick={(event) => {
									event.stopPropagation();
									step(-1);
								}}
								aria-label="Foto sebelumnya"
								className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:left-8"
							>
								<ChevronLeft className="h-5 w-5" />
							</button>
						)}

						<img
							key={openIndex}
							src={activeImage.src}
							srcSet={activeImage.srcSet}
							sizes="90vw"
							alt={active?.alt || title || ""}
							onLoad={() => setLoaded(true)}
							onClick={(event) => event.stopPropagation()}
							className={`max-h-[80vh] max-w-[88vw] rounded-lg object-contain shadow-2xl transition duration-300 ${
								loaded ? "scale-100 opacity-100" : "scale-95 opacity-0"
							}`}
						/>

						{images.length > 1 && (
							<button
								type="button"
								onClick={(event) => {
									event.stopPropagation();
									step(1);
								}}
								aria-label="Foto berikutnya"
								className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:right-8"
							>
								<ChevronRight className="h-5 w-5" />
							</button>
						)}

						{images.length > 1 && (
							<div
								onClick={(event) => event.stopPropagation()}
								className="absolute bottom-5 left-1/2 flex max-w-[90vw] -translate-x-1/2 gap-1.5 overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-1.5"
							>
								{images.map((image, index) => (
									<button
										type="button"
										key={image.id || index}
										onClick={() => open(index)}
										aria-label={`Foto ${index + 1}`}
										aria-current={index === openIndex}
										className={`h-9 w-12 shrink-0 overflow-hidden rounded-md border-2 transition ${
											index === openIndex
												? "border-primary opacity-100"
												: "border-transparent opacity-40 hover:opacity-70"
										}`}
									>
										<img
											src={resolveStrapiUrl(
												image.formats?.thumbnail?.url || image.url,
											)}
											alt=""
											loading="lazy"
											decoding="async"
											className="h-full w-full object-cover"
										/>
									</button>
								))}
							</div>
						)}
					</div>,
					document.body,
				)}
		</>
	);
}
