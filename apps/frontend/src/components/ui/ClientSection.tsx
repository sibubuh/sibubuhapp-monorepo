import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { useRef, useState, useEffect } from "react";
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
  speed: number;
};

const defaultPositions: Pick<Client, "x" | "y" | "speed">[] = [
  { x: -500, y: -300, speed: 0.25 }, // top-left far
  { x: 500, y: -280, speed: 0.35 },  // top-right far
  { x: -600, y: 100, speed: 0.4 },   // mid-left outside
  { x: 600, y: 120, speed: 0.5 },    // mid-right outside
  { x: 0, y: 320, speed: 0.2 },      // bottom center
];
const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;
function DummyLogo({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="flex flex-col items-center justify-center ">
      {src ? (
        <img src={src} alt={alt} className="w-24 h-24 object-contain mb-1" />
      ) : (
        <div className="w-24 h-24 bg-white rounded mb-1" />
      )}
      <span className="text-[10px] text-white">{alt}</span>
    </div>
  );
}

export default function ClientsParallax() {
  const ref = useRef(null);
  const [clientData, setClientData] = useState<ClientItem[]>([]);
  const [clientTitle, setClientTitle] = useState<string>("");
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
  console.log("Fetched client data:", clientData);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const clients = clientData.length > 0
    ? clientData.map((client, i) => ({
        ...defaultPositions[i],
        //name: client.text,
        src: BASE_URL + client.image?.url || "",
      }))
    : defaultPositions.map((pos, i) => ({
        ...pos,
        name: `Logo ${i + 1}`,
        src: "",
      }));

  return (
    <section ref={ref} className="relative h-[250vh] bg-[#0E172B]">
      {/* STICKY VIEWPORT */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden text-white">

        {/* CENTER TEXT */}
        <div className="absolute z-20 text-center max-w-2xl px-4">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            {clientTitle}
          </h2>
          <div className="text-white [&_p]:mb-0">
            <StrapiBlocks data={clientDescription} className="text-white" />
          </div>
        </div>

        {/* LOGOS */}
        {clients.map((client, i) => {
          // Parallax movement
          const yMove = useTransform(
            scrollYProgress,
            [0, 1],
            [client.y, client.y * -client.speed * 6]
          );

          const xMove = useTransform(
            scrollYProgress,
            [0, 1],
            [client.x, client.x * client.speed]
          );

          const zoom = useTransform(scrollYProgress, [0, 0.5, 2, 3], [0.6, 1.8, 0.6, 1]);

          // 👇 GLOBAL reveal (ALL logos together)
          const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
          const blur = useTransform(scrollYProgress, [0, 0.3], [12, 0]);

          // ✅ SSR-safe filter
          const filter = useMotionTemplate`blur(${blur}px)`;

          return (
            <motion.div
              key={i}
              style={{
                x: xMove,
                y: yMove,
                opacity,
                scale: zoom,
                filter,
              }}
              className={`absolute ${
                i % 2 === 0 ? "opacity-60" : "opacity-90"
              }`}
            >
              <DummyLogo src={client.src} alt={client.name} />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
