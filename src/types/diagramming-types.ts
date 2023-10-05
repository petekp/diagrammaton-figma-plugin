import { z } from "zod";

export const Node = z.object({
  id: z.string(),
  label: z.string(),
  shape: z.enum(["RECTANGLE", "ROUNDED_RECTANGLE", "ELLIPSE", "DIAMOND"]),
});

const MagnetDirection = z.enum(["TOP", "BOTTOM", "LEFT", "RIGHT"]);

export const NodeLink = z.object({
  label: z.string(),
  fromMagnet: MagnetDirection,
  toMagnet: MagnetDirection,
});

export const DiagramElement = z.object({
  from: z.object({
    id: z.string(),
    label: z.string(),
    shape: z.string(),
  }),
  link: z.object({
    label: z.string(),
    fromMagnet: MagnetDirection,
    toMagnet: MagnetDirection,
  }),
  to: z.object({
    id: z.string(),
    label: z.string(),
    shape: z.string(),
  }),
});

export const Diagram = z.object({
  elements: z.array(DiagramElement),
  orientation: z.enum(["TB", "TD", "BT", "LR", "RL"]),
});

export const Position = z.object({
  x: z.number(),
  y: z.number(),
});
