import { h } from "preact";
import { animate, motion, useMotionValue } from "framer-motion";
import { useEffect } from "preact/hooks";

export default function Logo({
  size = 60,
  eyeHeight,
  isDarkMode,
}: {
  size?: number;
  eyeHeight?: number;
  isDarkMode?: boolean;
}) {
  const svgHeight = 143;
  const maskHeight = useMotionValue(eyeHeight);
  const maskY = useMotionValue((svgHeight - eyeHeight) / 2);

  const gradient = isDarkMode
    ? `translate(0 10) rotate(0) scale(300)`
    : "translate(0 120) rotate(0) scale(300)";
  const gradient2 = isDarkMode
    ? "translate(0 200) rotate(0) scale(300)"
    : "translate(0 -20) rotate(0) scale(200)";

  useEffect(() => {
    const controls = animate(maskHeight, eyeHeight, {
      type: "tween",
      duration: 0.1,
      onUpdate: (value) => {
        maskY.set((svgHeight - value) / 2);
      },
    });

    return controls.stop;
  }, [eyeHeight, maskHeight, maskY, svgHeight]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 143 143"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M111.154 26.3721H33.1543C29.8406 26.3721 27.1543 29.0584 27.1543 32.3721V110.372C27.1543 113.686 29.8406 116.372 33.1543 116.372H111.154C114.468 116.372 117.154 113.686 117.154 110.372V32.3721C117.154 29.0584 114.468 26.3721 111.154 26.3721ZM33.1543 16.3721C24.3177 16.3721 17.1543 23.5355 17.1543 32.3721V110.372C17.1543 119.209 24.3177 126.372 33.1543 126.372H111.154C119.991 126.372 127.154 119.209 127.154 110.372V32.3721C127.154 23.5355 119.991 16.3721 111.154 16.3721H33.1543Z"
        fill="url(#paint0_angular_162_673)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M130.551 66.9117L75.397 11.7574C73.0538 9.41421 69.2548 9.41421 66.9117 11.7574L11.7574 66.9117C9.41421 69.2548 9.41421 73.0538 11.7574 75.397L66.9117 130.551C69.2548 132.894 73.0538 132.894 75.397 130.551L130.551 75.397C132.894 73.0538 132.894 69.2548 130.551 66.9117ZM82.468 4.68629C76.2196 -1.5621 66.089 -1.5621 59.8406 4.68629L4.68629 59.8406C-1.5621 66.089 -1.5621 76.2196 4.68629 82.468L59.8406 137.622C66.089 143.871 76.2196 143.871 82.468 137.622L137.622 82.468C143.871 76.2196 143.871 66.089 137.622 59.8406L82.468 4.68629Z"
        fill="url(#paint1_angular_162_673)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M36.1543 16.3721H64.6543V26.3721H36.1543V16.3721ZM117.155 63.873V37.373H127.155V63.873H117.155ZM17.1548 105.873V77.873H27.1548V105.873H17.1548ZM77.1543 116.372H105.654V126.372H77.1543V116.372Z"
        fill="url(#paint2_angular_162_673)"
      />
      <motion.mask
        id="mask0_162_673"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="28"
        y={maskY}
        width="89"
        height={maskHeight}
      >
        <path
          d="M28.1543 42.4563C61.4366 22.9316 80.6448 21.7674 116.154 42.4563V100.78C81.2206 120.143 61.9641 120.332 28.1543 100.78V42.4563Z"
          fill="#D9D9D9"
        />
      </motion.mask>
      <g mask="url(#mask0_162_673)">
        <g filter="url(#filter0_ii_162_673)">
          <path
            fillRule={isDarkMode ? "inherit" : "evenodd"}
            clipRule="evenodd"
            d="M71.5984 94.8707C84.4058 94.8707 94.7882 84.4883 94.7882 71.681C94.7882 58.8736 84.4058 48.4912 71.5984 48.4912C58.7911 48.4912 48.4087 58.8736 48.4087 71.681C48.4087 84.4883 58.7911 94.8707 71.5984 94.8707ZM77.3604 65.9142C80.3957 68.9494 84.3447 69.9214 86.1809 68.0853C88.017 66.2491 88.0632 61.2819 85.028 58.2467C81.9927 55.2115 77.0256 55.2576 75.1894 57.0938C73.3532 58.93 74.3252 62.879 77.3604 65.9142Z"
            fill="url(#paint3_radial_162_673)"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_ii_162_673"
          x="48.4087"
          y="42.4912"
          width="46.3794"
          height="58.3799"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6" />
          <feGaussianBlur stdDeviation="7" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.191667 0 0 0 0 0.8545 0 0 0 0 1 0 0 0 0.6 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_162_673"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-6" />
          <feGaussianBlur stdDeviation="5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 0 0 0 0 0 0.6 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_innerShadow_162_673"
            result="effect2_innerShadow_162_673"
          />
        </filter>
        <radialGradient
          id="paint0_angular_162_673"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform={gradient}
        >
          <stop stopColor="#FF4789" />
          <stop offset="0.260417" stopColor="#FFD748" />
          <stop offset="0.5625" stopColor="#75F6D7" />
          <stop offset="0.828125" stopColor="#FF4ACC" />
        </radialGradient>
        <radialGradient
          id="paint1_angular_162_673"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform={gradient2}
        >
          <stop offset="0.0375323" stopColor="#217AFF" />
          <stop offset="0.213542" stopColor="#02C7D3" />
          <stop offset="0.380208" stopColor="#22DCE8" />
          <stop offset="0.536458" stopColor="#4E88F2" />
          <stop offset="0.723958" stopColor="#5F45FF" />
        </radialGradient>
        <radialGradient
          id="paint2_angular_162_673"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform={gradient}
        >
          <stop stopColor="#FF4789" />
          <stop offset="0.260417" stopColor="#FFD748" />
          <stop offset="0.5625" stopColor="#75F6D7" />
          <stop offset="0.828125" stopColor="#FF4ACC" />
        </radialGradient>
        <radialGradient
          id="paint3_radial_162_673"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(54.9333 88.0291) rotate(-45) scale(40.2046)"
        >
          <stop stopColor="#EBFFE1" />
          <stop offset="0.369792" stopColor="#88B2F0" />
          <stop offset="1" stopColor="#1400FF" />
        </radialGradient>
      </defs>
    </svg>
  );
}
