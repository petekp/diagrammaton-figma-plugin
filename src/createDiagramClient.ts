import * as dagre from "dagre";

import { DiagramElement, Position } from "./types";
import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH } from "./constants";

const layoutDiagram = ({
  diagram,
  orientation,
}: {
  diagram: DiagramElement[];
  orientation: string;
}): Map<string, Position> => {
  const g = new dagre.graphlib.Graph()
    .setGraph({ rankdir: orientation, nodesep: 200, ranksep: 200 })
    .setDefaultEdgeLabel(() => ({}));

  console.log(diagram);

  diagram.forEach(({ from, to }) => {
    console.log(from, to);
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

export const createDiagram = async ({
  parsedOutput,
  orientation = "LR",
}: {
  parsedOutput: DiagramElement[];
  orientation?: string;
}): Promise<{ [key: string]: Position }> => {
  const positionsObject: { [key: string]: Position } = {};

  layoutDiagram({ diagram: parsedOutput, orientation }).forEach(
    (value, key) => (positionsObject[key] = value)
  );
  return positionsObject;
};
