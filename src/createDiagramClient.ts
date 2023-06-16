import * as dagre from "dagre";

import { DiagramElement, Position } from "./types";
import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH } from "./constants";

const layoutDiagram = (diagram: DiagramElement[]): Map<string, Position> => {
  const g = new dagre.graphlib.Graph()
    .setGraph({ rankdir: "LR", nodesep: 200, ranksep: 200 })
    .setDefaultEdgeLabel(() => ({}));

  diagram.forEach(({ from, to }) => {
    g.setNode(from.id, {
      label: from.label,
      width: DEFAULT_NODE_WIDTH,
      height: DEFAULT_NODE_HEIGHT,
    })
      .setNode(to.id, {
        label: to.label,
        width: DEFAULT_NODE_WIDTH,
        height: DEFAULT_NODE_HEIGHT,
      })
      .setEdge(from.id, to.id);
  });
  dagre.layout(g);
  return new Map(g.nodes().map((v) => [v, { x: g.node(v).x, y: g.node(v).y }]));
};

export const createDiagram = async (
  parsedOutput: DiagramElement[]
): Promise<{ [key: string]: Position }> => {
  const positionsObject: { [key: string]: Position } = {};

  layoutDiagram(parsedOutput).forEach(
    (value, key) => (positionsObject[key] = value)
  );
  return positionsObject;
};
