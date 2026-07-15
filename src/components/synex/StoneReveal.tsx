import type { MouseEvent } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";

type StoneRevealProps = {
  side: "left" | "right";
  baseSrc: string;
  grassSrc: string;
  zBase: number;
  zGrass: number;
};

export default function StoneReveal({
  side,
  baseSrc,
  grassSrc,
  zBase,
  zGrass,
}: StoneRevealProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const radiusRaw = useMotionValue(0);
  const radius = useSpring(radiusRaw, { stiffness: 200, damping: 25 });
  const maskImage = useMotionTemplate`radial-gradient(circle ${radius}px at ${x}px ${y}px, black 0%, black 40%, transparent 100%)`;

  const updatePointer = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - bounds.left);
    y.set(event.clientY - bounds.top);
  };

  return (
    <div
      className={`absolute bottom-0 h-[280px] w-fit cursor-crosshair sm:h-[380px] md:h-[500px] lg:h-[600px] xl:h-[680px] ${
        side === "left" ? "left-0" : "right-0"
      }`}
      onMouseEnter={(event) => {
        updatePointer(event);
        radiusRaw.set(120);
      }}
      onMouseMove={updatePointer}
      onMouseLeave={() => radiusRaw.set(0)}
    >
      <motion.img
        src={baseSrc}
        alt=""
        aria-hidden="true"
        className="relative h-full w-auto max-w-none select-none object-contain"
        style={{
          zIndex: zBase,
          objectPosition: `${side} bottom`,
        }}
        initial={{ opacity: 0, x: side === "left" ? -40 : 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
        draggable={false}
      />

      <motion.img
        src={grassSrc}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-auto max-w-none select-none object-contain"
        style={{
          zIndex: zGrass,
          objectPosition: `${side} bottom`,
          maskImage,
          WebkitMaskImage: maskImage,
        }}
        draggable={false}
      />
    </div>
  );
}
