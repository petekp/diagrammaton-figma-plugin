import { h } from "preact";

function Logo({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 781 781"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="636.62"
        y="144.62"
        width="492"
        height="492"
        transform="rotate(90 636.62 144.62)"
        stroke="#FD2E79"
        stroke-width="60"
      />
      <rect
        x="390.31"
        y="42.4264"
        width="491.982"
        height="491.982"
        transform="rotate(45 390.31 42.4264)"
        stroke="#6F00FD"
        stroke-width="60"
      />
      <rect x="114.62" y="165.62" width="60" height="226" fill="#FD2E79" />
      <rect
        x="165.62"
        y="666.62"
        width="60"
        height="226"
        transform="rotate(-90 165.62 666.62)"
        fill="#FD2E79"
      />
      <rect
        x="666.62"
        y="617.62"
        width="60"
        height="226"
        transform="rotate(-180 666.62 617.62)"
        fill="#FD2E79"
      />
      <rect
        x="616.62"
        y="114.62"
        width="60"
        height="226"
        transform="rotate(90 616.62 114.62)"
        fill="#FD2E79"
      />
      <mask
        id="mask0_78_298"
        style="mask-type:alpha"
        maskUnits="userSpaceOnUse"
        x="175"
        y="174"
        width="440"
        height="433"
      >
        <rect x="175" y="174" width="440" height="433" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_78_298)">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M390 505C453.513 505 505 453.513 505 390C505 368.63 499.171 348.621 489.016 331.476C489.978 346.009 485.175 360.779 477.101 368.853C463.201 382.753 437.163 379.252 418.944 361.033C400.725 342.814 397.224 316.776 411.124 302.876C419.195 294.805 433.955 290.003 448.482 290.96C431.347 280.82 411.353 275 390 275C326.487 275 275 326.487 275 390C275 453.513 326.487 505 390 505Z"
          fill="#00E941"
        />
      </g>
    </svg>
  );
}

export default Logo;
