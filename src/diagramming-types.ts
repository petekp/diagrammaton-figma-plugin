export interface Node {
  id: string;
  label: string;
  shape: ShapeWithTextNode["shapeType"];
}

export interface NodeLink {
  label: string;
  condition?: string;
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
