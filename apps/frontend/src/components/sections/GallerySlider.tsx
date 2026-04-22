import { useState, useEffect, useCallback } from "react";

function GallerySlider({ images, baseUrl, title }: any) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (lightbox === null) return;
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") { setImgLoaded(false); setLightbox((p) => (p! + 1) % images.length); }
      if (e.key === "ArrowLeft")  { setImgLoaded(false); setLightbox((p) => (p! - 1 + images.length) % images.length); }
    },
    [lightbox, images.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  const openLightbox = (i: number) => { setImgLoaded(false); setLightbox(i); };

  const goPrev = (e: React.MouseEvent) => { e.stopPropagation(); setImgLoaded(false); setLightbox((p) => (p! - 1 + images.length) % images.length); };
  const goNext = (e: React.MouseEvent) => { e.stopPropagation(); setImgLoaded(false); setLightbox((p) => (p! + 1) % images.length); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=DM+Sans:wght@300;400&display=swap');

        .g-root {
          font-family: 'DM Sans', sans-serif;
          --accent: #ff5c3a;
          --bg: #f7f4f0;
          --dark: #1a1714;
          background: var(--bg);
          border-radius: 16px;
          padding: 20px;

          margin: 0 auto;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .g-root.visible { opacity: 1; transform: translateY(0); }

        .g-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .g-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--dark);
          letter-spacing: -0.02em;
        }
        .g-count {
          font-size: 12px;
          color: #999;
          font-weight: 300;
          letter-spacing: 0.05em;
        }

        /* Grid */
        .g-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 8px;
        }

        .g-thumb {
          position: relative;
          aspect-ratio: 1;
          border-radius: 10px;
          overflow: hidden;
          cursor: zoom-in;
          background: #e8e4de;
          opacity: 0;
          transform: scale(0.94);
          animation: thumbIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes thumbIn {
          to { opacity: 1; transform: scale(1); }
        }
        .g-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .g-thumb:hover img { transform: scale(1.08); }

        .g-thumb-overlay {
          position: absolute;
          inset: 0;
          background: rgba(26, 23, 20, 0);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.25s ease;
        }
        .g-thumb:hover .g-thumb-overlay { background: rgba(26, 23, 20, 0.35); }
        .g-thumb-icon {
          opacity: 0;
          transform: scale(0.7);
          transition: opacity 0.2s ease, transform 0.2s ease;
          color: #fff;
        }
        .g-thumb:hover .g-thumb-icon { opacity: 1; transform: scale(1); }
        .g-thumb-icon svg { width: 22px; height: 22px; }

        .g-thumb:first-child {
          grid-column: span 2;
          grid-row: span 2;
          border-radius: 12px;
        }

        /* Lightbox */
        .g-lb-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(10, 9, 8, 0.92);
          backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: lbIn 0.22s ease forwards;
        }
        @keyframes lbIn { from { opacity: 0; } to { opacity: 1; } }

        .g-lb-img-wrap {
          position: relative;
          max-width: min(88vw, 960px);
          max-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .g-lb-img {
          max-width: 100%;
          max-height: 80vh;
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: 10px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6);
          opacity: 0;
          transform: scale(0.97);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .g-lb-img.loaded { opacity: 1; transform: scale(1); }

        .g-lb-spinner {
          position: absolute;
          width: 26px;
          height: 26px;
          border: 2px solid rgba(255,255,255,0.12);
          border-top-color: rgba(255,255,255,0.7);
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .g-lb-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.14);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          z-index: 10;
        }
        .g-lb-nav:hover { background: var(--accent); border-color: var(--accent); transform: translateY(-50%) scale(1.1); }
        .g-lb-nav.prev { left: -58px; }
        .g-lb-nav.next { right: -58px; }
        .g-lb-nav svg { width: 16px; height: 16px; }

        .g-lb-close {
          position: fixed;
          top: 18px;
          right: 18px;
          z-index: 1001;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.14);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        .g-lb-close:hover { background: var(--accent); transform: scale(1.1) rotate(90deg); }
        .g-lb-close svg { width: 14px; height: 14px; }

        .g-lb-strip {
          position: fixed;
          bottom: 22px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          max-width: 90vw;
          overflow-x: auto;
          padding: 4px 6px;
          scrollbar-width: none;
          background: rgba(0,0,0,0.3);
          border-radius: 12px;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .g-lb-strip::-webkit-scrollbar { display: none; }

        .g-lb-strip-thumb {
          flex: 0 0 auto;
          width: 48px;
          height: 36px;
          border-radius: 6px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          opacity: 0.38;
          transition: opacity 0.2s, border-color 0.2s, transform 0.2s;
        }
        .g-lb-strip-thumb:hover { opacity: 0.65; transform: translateY(-2px); }
        .g-lb-strip-thumb.active { opacity: 1; border-color: var(--accent); transform: translateY(-3px); }
        .g-lb-strip-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .g-lb-counter {
          position: fixed;
          top: 22px;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(255,255,255,0.45);
          font-size: 11px;
          letter-spacing: 0.12em;
          font-family: 'Syne', sans-serif;
          background: rgba(0,0,0,0.3);
          padding: 5px 12px;
          border-radius: 20px;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.08);
        }
      `}</style>

      <div className={`g-root${visible ? " visible" : ""}`}>
        <div className="g-header">
          {title && <div className="g-title">{title}</div>}
          <div className="g-count">{images.length} photos</div>
        </div>

        <div className="g-grid">
          {images.map((img: any, i: number) => (
            <div
              key={i}
              className="g-thumb"
              style={{ animationDelay: `${i * 45}ms` }}
              onClick={() => openLightbox(i)}
            >
              <img src={`${baseUrl}${img.url}`} alt={img.alt || `Photo ${i + 1}`} />
              <div className="g-thumb-overlay">
                <div className="g-thumb-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightbox !== null && (
        <div className="g-lb-backdrop" onClick={() => setLightbox(null)}>
          <button className="g-lb-close" onClick={() => setLightbox(null)} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="g-lb-counter">
            {String(lightbox + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </div>

          <div className="g-lb-img-wrap" onClick={(e) => e.stopPropagation()}>
            {images.length > 1 && (
              <button className="g-lb-nav prev" onClick={goPrev} aria-label="Previous">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}

            {!imgLoaded && <div className="g-lb-spinner" />}
            <img
              key={lightbox}
              src={`${baseUrl}${images[lightbox].url}`}
              alt={images[lightbox].alt || title}
              className={`g-lb-img${imgLoaded ? " loaded" : ""}`}
              onLoad={() => setImgLoaded(true)}
            />

            {images.length > 1 && (
              <button className="g-lb-nav next" onClick={goNext} aria-label="Next">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
          </div>

          <div className="g-lb-strip" onClick={(e) => e.stopPropagation()}>
            {images.map((img: any, i: number) => (
              <div
                key={i}
                className={`g-lb-strip-thumb${i === lightbox ? " active" : ""}`}
                onClick={() => { setImgLoaded(false); setLightbox(i); }}
              >
                <img src={`${baseUrl}${img.url}`} alt="" />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default GallerySlider;
