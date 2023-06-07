type NodeId = string;

interface Node {
  id: string;
  label: string;
}

interface NodeLink {
  label: string;
  condition?: string;
}

interface DiagramElement {
  from: Node;
  link: NodeLink;
  to: Node;
}

interface Position {
  x: number;
  y: number;
}

function layoutDiagram(
  diagram: DiagramElement[]
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  // Build adjacency list
  const adjList: { [key: string]: Node[] } = {};

  diagram.forEach((element) => {
    const { from, to } = element;
    if (!adjList[from.id]) {
      adjList[from.id] = [];
    }
    adjList[from.id].push(to);
  });

  // DFS to layout nodes
  const nodeWidth = 100;
  const nodeHeight = 50;
  const horizontalSpacing = 200;
  const verticalSpacing = 150;
  let currentX = 0;
  let currentY = 0;
  let maxY = 0;

  const visited = new Set<string>();

  function dfs(node: Node) {
    if (visited.has(node.id)) {
      return;
    }
    visited.add(node.id);

    positions.set(node.id, { x: currentX, y: currentY });

    const adjacentNodes = adjList[node.id];
    if (adjacentNodes && adjacentNodes.length > 0) {
      currentY += nodeHeight + verticalSpacing;
      maxY = Math.max(maxY, currentY);
      adjacentNodes.forEach((adjNode) => dfs(adjNode));
    } else {
      currentY = maxY;
      currentX += nodeWidth + horizontalSpacing;
    }
  }

  dfs(diagram[0].from);

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
