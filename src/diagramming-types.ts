interface Point {
    x: number;
    y: number;
  }
  
  export type Node = {
    id: string;
    position: Point;
    shape: ShapeWithTextNode;
  }
  
  export type Edge = {
    id: string;
    startNodeId: string;
    endNodeId: string;
    connector: ConnectorNode;
  }
  
  export type Diagram = {
    id: string;
    nodes: Array<Node>;
    edges: Array<Edge>;
  }

  export type NodeMap = { [id: string]: Node };