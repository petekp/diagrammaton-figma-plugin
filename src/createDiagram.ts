type NodeId = string;

interface Node {
  id: string;
  label: string;
}

interface NodeLink {
  label: string;
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

function createNode(node: Node, position: Position): FrameNode {
  const figmaNode = figma.createShapeWithText();
  figmaNode.shapeType = "SQUARE";
  figmaNode.text.characters = node.label;
  figmaNode.resize(180, 85);

  const frame = figma.createFrame();
  frame.appendChild(figmaNode);
  frame.x = position.x;
  frame.y = position.y;
  frame.resize(180, 85);

  return frame;
}

function createLink(
  from: SceneNode,
  to: SceneNode,
  link: NodeLink
): ConnectorNode {
  const connector = figma.createConnector();

  const fromPosition = from.relativeTransform[0][2];
  const toPosition = to.relativeTransform[0][2];

  let fromMagnet, toMagnet;

  if (fromPosition === toPosition) {
    // same x, use top and bottom
    fromMagnet = "BOTTOM";
    toMagnet = "TOP";
  } else if (fromPosition < toPosition) {
    // from is left of to, use right and left
    fromMagnet = "RIGHT";
    toMagnet = "LEFT";
  } else {
    // from is right of to, use left and right
    fromMagnet = "LEFT";
    toMagnet = "RIGHT";
  }

  connector.connectorStart = { endpointNodeId: from.id, magnet: fromMagnet };
  connector.connectorEnd = { endpointNodeId: to.id, magnet: toMagnet };

  if (link.label) {
    const text = connector.text;
    const textBackground = connector.textBackground;

    text.characters = link.label;
    textBackground.fills = [
      { type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.2 },
    ];
  }

  return connector;
}

export async function createDiagram(
  parsedOutput: DiagramElement[]
): Promise<void> {
  const positions = layoutDiagram(parsedOutput);
  await drawDiagram(parsedOutput, positions);
  figma.notify("Diagram drawn successfully");
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

async function drawDiagram(
  diagram: DiagramElement[],
  positions: Map<string, { x: number; y: number }>
): Promise<void> {
  const nodeShapes: { [id: string]: FrameNode } = {};

  // Create nodes
  diagram.forEach((element) => {
    const { from, to } = element;

    [from, to].forEach((node) => {
      if (!nodeShapes[node.id]) {
        const position = positions.get(node.id);
        if (position) {
          const frame = createNode(node, position); // Assuming you have the createNode function from the previous response
          nodeShapes[node.id] = frame;
          figma.currentPage.appendChild(frame);
        }
      }
    });

    // Create edges
    const link = createLink(
      nodeShapes[from.id],
      nodeShapes[to.id],
      element.link
    ); // Assuming you have the createLink function from the previous response
    figma.currentPage.appendChild(link);
  });
}
