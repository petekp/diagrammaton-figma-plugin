const nodeStyles: {
  [key in "default" | "decision" | "negative" | "positive"]: {
    fill: Array<Paint>;
    text: Array<Paint>;
    stroke: Array<Paint>;
  };
} = {
  default: {
    fill: [
      { type: "SOLID", color: { r: 0.59, g: 0.278, b: 1 }, opacity: 0.05 },
    ],
    text: [
      {
        type: "SOLID",
        color: { r: 26 / 255, g: 13 / 255, b: 45 / 255 },
        opacity: 1,
      },
    ],
    stroke: [{ type: "SOLID", color: { r: 0.59, g: 0.278, b: 1 }, opacity: 1 }],
  },
  decision: {
    fill: [
      {
        type: "SOLID",
        color: { r: 252 / 255, g: 209 / 255, b: 156 / 255 },
        opacity: 0.1,
      },
    ],
    text: [
      {
        type: "SOLID",
        color: { r: 43 / 255, g: 36 / 255, b: 27 / 255 },
        opacity: 1,
      },
    ],
    stroke: [
      {
        type: "SOLID",
        color: { r: 252 / 255, g: 209 / 255, b: 156 / 255 },
        opacity: 1,
      },
    ],
  },
  negative: {
    fill: [
      {
        type: "SOLID",
        color: { r: 241 / 255, g: 71 / 255, b: 34 / 255 },
        opacity: 0.1,
      },
    ],
    text: [
      {
        type: "SOLID",
        color: { r: 41 / 255, g: 12 / 255, b: 7 / 255 },
        opacity: 1,
      },
    ],
    stroke: [
      {
        type: "SOLID",
        color: { r: 241 / 255, g: 71 / 255, b: 34 / 255 },
        opacity: 1,
      },
    ],
  },
  positive: {
    fill: [
      {
        type: "SOLID",
        color: { r: 20 / 255, g: 174 / 255, b: 92 / 255 },
        opacity: 0.1,
      },
    ],
    text: [
      {
        type: "SOLID",
        color: { r: 10 / 255, g: 38 / 255, b: 21 / 255 },
        opacity: 1,
      },
    ],
    stroke: [
      {
        type: "SOLID",
        color: { r: 20 / 255, g: 174 / 255, b: 92 / 255 },
        opacity: 1,
      },
    ],
  },
};

export default nodeStyles;
