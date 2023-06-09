import * as dagre from "dagre";

import { DiagramElement, Position } from "./types";

function layoutDiagram(
  diagram: DiagramElement[]
): Map<string, { x: number; y: number }> {
  const g = new dagre.graphlib.Graph();

  // Set an object for the graph label
  g.setGraph({ rankdir: "LR", nodesep: 100, ranksep: 100 });

  // Default to assigning a new object as a label for each new edge.
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to the graph
  diagram.forEach((element) => {
    const { from, to } = element;
    g.setNode(from.id, { label: from.label, width: 180, height: 85 });
    g.setNode(to.id, { label: to.label, width: 180, height: 85 });
  });

  // Add edges to the graph
  diagram.forEach((element) => {
    g.setEdge(element.from.id, element.to.id);
  });

  // Compute the layout
  dagre.layout(g);

  // Map node IDs to positions
  const positions = new Map();
  g.nodes().forEach((v) => {
    const nodeInfo = g.node(v);
    positions.set(v, { x: nodeInfo.x, y: nodeInfo.y });
  });

  return positions;
}

export async function createDiagram(
  parsedOutput: DiagramElement[]
): Promise<{ [key: string]: Position }> {
  const positionsMap = layoutDiagram(parsedOutput);
  const positionsObject: { [key: string]: Position } = {};
  positionsMap.forEach((value, key) => {
    positionsObject[key] = value;
  });
  return positionsObject;
}
