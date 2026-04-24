import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useSpring,
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

type Client = {
  name: string;
  src: string;
  x: number;
  y: number;
};

const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;

/* ✅ Generate positions OUTSIDE center */
function generatePositions(count: number, isMobile: boolean) {
  const positions: Pick<Client, "x" | "y">[] = [];

  const radiusXBase = isMobile ? 250 : 600;
  const radiusYBase = isMobile ? 200 : 400;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;

    const radiusX = radiusXBase + Math.random() * radiusXBase;
    const radiusY = radiusYBase + Math.random() * radiusYBase;

    const x = Math.cos(angle) * radiusX;
    const y = Math.sin(angle) * radiusY;

    positions.push({ x, y });
  }

  return positions;
}

/* ✅ Logo UI */
function DummyLogo({
  src,
  alt,
  isMobile,
}: {
  src: string;
  alt: string;
  isMobile: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center">
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`object-contain mb-1 ${
            isMobile ? "w-14 h-14" : "w-24 h-24"
          }`}
        />
      ) : (
        <div
          className={`bg-white rounded mb-1 ${
            isMobile ? "w-12 h-12" : "w-20 h-20"
          }`}
        />
      )}
      {!isMobile && (
        <span className="text-[10px] text-white">{alt}</span>
      )}
    </div>
  );
}

/* ✅ Floating Logo */
function FloatingLogo({
  client,
  scrollYProgress,
  isMobile,
}: {
  client: Client;
  scrollYProgress: any;
  isMobile: boolean;
}) {
  const factor = isMobile ? 0.5 : 1;

  /* ✅ move to center */
  const xRaw = useTransform(
    scrollYProgress,
    [0, 0.7],
    [client.x * factor, 0]
  );

  const yRaw = useTransform(
    scrollYProgress,
    [0, 0.7],
    [client.y * factor, 0]
  );

  const xMove = useSpring(xRaw, { stiffness: 60, damping: 20 });
  const yMove = useSpring(yRaw, { stiffness: 60, damping: 20 });

  /* ✅ fade OUT at center */
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.6, 0.85, 1],
    [0, 1, 1, 0]
  );

  /* ✅ blur IN when near center */
  const blur = useTransform(
    scrollYProgress,
    [0, 0.6, 1],
    [10, 0, 12]
  );

  /* ✅ optional shrink before disappear */
  const scale = useTransform(
    scrollYProgress,
    [0, 0.7, 1],
    [0.6, 1, 0.8]
  );

  const filter = useMotionTemplate`blur(${blur}px)`;

  return (
    <motion.div
      style={{
        x: xMove,
        y: yMove,
        opacity,
        scale,
        filter,
      }}
      className="absolute"
    >
      <DummyLogo
        src={client.src}
        alt={client.name}
        isMobile={isMobile}
      />
    </motion.div>
  );
}

export default function ClientsParallax() {
  const ref = useRef(null);

  const [clientData, setClientData] = useState<ClientItem[]>([]);
  const [clientTitle, setClientTitle] = useState("");
  const [clientDescription, setClientDescription] = useState<unknown>(null);

  const [isMobile, setIsMobile] = useState(false);

  /* ✅ detect mobile */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ✅ fetch data */
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

  /* ✅ limit logos on mobile */
  const limitedClientData = useMemo(() => {
    if (isMobile) return clientData.slice(0, 6);
    return clientData;
  }, [clientData, isMobile]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  /* ✅ positions */
  const positions = useMemo(
    () => generatePositions(limitedClientData.length || 6, isMobile),
    [limitedClientData.length, isMobile]
  );

  /* ✅ build clients */
  const clients: Client[] =
    limitedClientData.length > 0
      ? limitedClientData.map((c, i) => ({
          name: c.text || `Logo ${i + 1}`,
          src: c.image?.url ? BASE_URL + c.image.url : "",
          ...positions[i],
        }))
      : positions.map((pos, i) => ({
          name: `Logo ${i + 1}`,
          src: "",
          ...pos,
        }));

  return (
    <section
      ref={ref}
      className={`relative ${
        isMobile ? "h-[180vh]" : "h-[250vh]"
      } bg-[#0E172B]`}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden text-white">

        {/* CENTER TEXT */}
        <div className="absolute z-20 text-center max-w-2xl px-4">
          <h2 className="text-3xl md:text-6xl font-bold mb-6">
            {clientTitle}
          </h2>
          <div className="text-white [&_p]:mb-0">
            <StrapiBlocks
              data={clientDescription}
              className="text-white"
            />
          </div>
        </div>

        {/* LOGOS */}
        {clients.map((client, i) => (
          <FloatingLogo
            key={i}
            client={client}
            scrollYProgress={scrollYProgress}
            isMobile={isMobile}
          />
        ))}
      </div>
    </section>
  );
}
