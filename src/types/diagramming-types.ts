export type Node = {
  id: string;
  label: string;
  shape: ShapeWithTextNode["shapeType"];
};

export type MagnetDirection = "TOP" | "BOTTOM" | "LEFT" | "RIGHT";

export type NodeLink = {
  label: string;
  fromMagnet: MagnetDirection;
  toMagnet: MagnetDirection;
};

export type DiagramElement = {
  from: Node;
  link: NodeLink | undefined;
  to: Node;
};

export type Diagram = {
  elements: DiagramElement[];
  orientation: "TB" | "TD" | "BT" | "LR" | "RL";
};

export type Position = {
  x: number;
  y: number;
};
