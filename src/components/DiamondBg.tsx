import { h } from "preact";
import { motion } from "framer-motion";

const diamondDelay = 0.5;
const diamondDamping = 24;
const diamondStiffness = 200;

const diamondPath = "M50 0 L100 50 L50 100 L0 50 Z";

const getScaleFactor = (index: number, total: number) => {
  return Math.log(index / total + 2);
};

export default function DiamondAnimation({
  numDiamonds,
}: {
  numDiamonds: number;
}) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      style={{
        position: "fixed",
        z: 0,
        left: 0,
        top: 0,
        aspectRatio: "square",
        transformOrigin: "center",
      }}
    >
      {Array.from({ length: numDiamonds }).map((_, index) => {
        const hue = (360 * index) / numDiamonds;

        return (
          <Diamond key={index} index={index} total={numDiamonds} hue={hue} />
        );
      })}
    </motion.svg>
  );
}

function Diamond({
  index,
  total,
  hue,
}: {
  index: number;
  total: number;
  hue: number;
}) {
  const scaleFactor = getScaleFactor(index, total);
  const color = `hsl(${hue}, var(--color-saturation), var(--color-lightness))`;

  const initial = {
    opacity: 0,
    scale: 1,
    rotate: 0,
  };

  const animate = {
    opacity: 0.5,
    scale: scaleFactor * 1.4,
    rotate: index * (93.12 / total),
    transition: {
      type: "spring",
      damping: diamondDamping + (index / total / 2) * (diamondDamping + 10),
      stiffness: diamondStiffness + (index / total) * (diamondDamping + 10),
      delay: diamondDelay + (index / total) * 1.4,
      restDelta: 0.001,
    },
  };

  return (
    <motion.path
      d={diamondPath}
      stroke={color}
      strokeLinecap={"round"}
      strokeWidth={0.14}
      fill="transparent"
      initial={initial}
      animate={animate}
    />
  );
}
