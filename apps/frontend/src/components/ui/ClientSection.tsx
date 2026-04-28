import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
import { getClient } from "../../../services/api";
import StrapiBlocks from "../sections/StrapiBlocks";

type ClientItem = {
  id: number;
  text: string;
  image: {
    id: number;
    url: string;
    width: number;
    height: number;
    name: string;
    size: number;
  };
};

type OrbitConfig = {
  rx: number;
  ry: number;
  startAngle: number;
  rotations: number;
  direction: 1 | -1;
  size: number;
  depthScale: number;
  opacity: number;
};

const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;

/**
 * Spread logos across 3 elliptical orbit rings, each with slightly different
 * radii so they appear to orbit at different depths.
 */
function buildOrbitConfigs(count: number): OrbitConfig[] {
  const rings: Omit<OrbitConfig, "startAngle">[] = [
    { rx: 560, ry: 180, rotations: 0.4,  direction:  1, size: 80, depthScale: 1.00, opacity: 1.0  },
    { rx: 420, ry: 140, rotations: 0.55, direction: -1, size: 68, depthScale: 0.88, opacity: 0.85 },
    { rx: 660, ry: 210, rotations: 0.28, direction:  1, size: 60, depthScale: 0.78, opacity: 0.70 },
  ];

  return Array.from({ length: count }, (_, i) => {
    const ring = rings[i % rings.length];
    const slotsInRing = Math.ceil(count / rings.length);
    const slotIdx = Math.floor(i / rings.length);
    const startAngle = (slotIdx / slotsInRing) * Math.PI * 2;
    return { ...ring, startAngle };
  });
}

// ------------------------------------------------------------------
// Single logo driven by scroll — position computed from scrollYProgress
// ------------------------------------------------------------------
function OrbitingLogo({
  src,
  name,
  config,
  scrollYProgress,
}: {
  src: string;
  name: string;
  config: OrbitConfig;
  scrollYProgress: any;
}) {
  const { rx, ry, startAngle, rotations, direction, size, depthScale, opacity: baseOpacity } = config;

  const angleSweep = rotations * Math.PI * 2 * direction;

  const x = useTransform(scrollYProgress, [0, 1], [
    Math.cos(startAngle) * rx,
    Math.cos(startAngle + angleSweep) * rx,
  ]);

  const y = useTransform(scrollYProgress, [0, 1], [
    Math.sin(startAngle) * ry,
    Math.sin(startAngle + angleSweep) * ry,
  ]);

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.85, 1],
    [0, baseOpacity, baseOpacity, 0]
  );

  const blurVal = useTransform(scrollYProgress, [0, 0.25], [14, 0]);
  const filter = useMotionTemplate`blur(${blurVal}px)`;

  const scale = useTransform(scrollYProgress, [0, 0.25], [0.7, depthScale]);

  return (
    <motion.div
      style={{ x, y, opacity, filter, scale }}
      className="absolute flex flex-col items-center justify-center"
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: size, height: size }}
          className="object-contain mb-1 drop-shadow-lg"
        />
      ) : (
        <div
          style={{ width: size, height: size }}
          className="bg-white/10 rounded-full mb-1"
        />
      )}
      <span className="text-[10px] text-white/60 tracking-wide">{name}</span>
    </motion.div>
  );
}

// ------------------------------------------------------------------
// Main section
// ------------------------------------------------------------------
export default function ClientsParallax() {
  const ref = useRef(null);

  const [clientData, setClientData] = useState<ClientItem[]>([]);
  const [clientTitle, setClientTitle] = useState("");
  const [clientDescription, setClientDescription] = useState<unknown>(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getClient({ locale: null });
      if (result?.client_list) {
        setClientData(result.client_list);
        setClientTitle(result.title || "");
        setClientDescription(result.description || null);
      }
    };
    fetchData();
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const orbitConfigs = useMemo(
    () => buildOrbitConfigs(clientData.length || 8),
    [clientData.length]
  );

  const clients = useMemo(() => {
    if (clientData.length > 0) {
      return clientData.map((c, i) => ({
        src: c.image?.url ? BASE_URL + c.image.url : "",
        //name: c.text || `Client ${i + 1}`,
        config: orbitConfigs[i],
      }));
    }
    return orbitConfigs.map((config, i) => ({
      src: "",
      //name: `Logo ${i + 1}`,
      config,
    }));
  }, [clientData, orbitConfigs]);

  return (
    <section ref={ref} className="relative h-[250vh] bg-[#0E172B]">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden text-white">

        {/* CENTER TEXT */}
        <div className="absolute z-20 text-center max-w-2xl px-4 pointer-events-none">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            {clientTitle}
          </h2>
          <div className="text-white/80 [&_p]:mb-0">
            <StrapiBlocks data={clientDescription} className="text-white" />
          </div>
        </div>

        {/* ORBITING LOGOS */}
        {clients.map((client, i) => (
          <OrbitingLogo
            key={i}
            src={client.src}
            //@ts-ignore
            name={client.name}
            config={client.config}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
}
