export interface Diagram {
  elements: DiagramElement[];
  orientation: "TB" | "TD" | "BT" | "LR" | "RL";
}

export interface Node {
  id: string;
  label: string;
  shape: ShapeWithTextNode["shapeType"];
}

export interface NodeLink {
  label: string;
}

export interface DiagramElement {
  from: Node;
  link: NodeLink;
  to: Node;
}

export interface Position {
  x: number;
  y: number;
}

export type MagnetDirection = "TOP" | "BOTTOM" | "LEFT" | "RIGHT";
