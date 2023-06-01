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
  figmaNode.resize(100, 50);

  const frame = figma.createFrame();
  frame.appendChild(figmaNode);
  frame.x = position.x;
  frame.y = position.y;
  frame.resize(100, 50);

  return frame;
}

function createLink(from: SceneNode, to: SceneNode, link: NodeLink): ConnectorNode {
  const connector = figma.createConnector();
  connector.connectorStart = { endpointNodeId: from.id, magnet: 'BOTTOM' };
  connector.connectorEnd = { endpointNodeId: to.id, magnet: 'TOP' };

  return connector;
}

export async function createDiagram(parsedOutput: DiagramElement[]): Promise<void> {
  const positions = layoutDiagram(parsedOutput);
  await drawDiagram(parsedOutput, positions);
  figma.notify('Diagram drawn successfully');
}

function layoutDiagram(
  diagram: DiagramElement[]
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const levels: { [key: string]: Node[] } = {};

  diagram.forEach((element) => {
    const { from, to } = element;

    if (!levels[from.id]) {
      levels[from.id] = [];
    }
    levels[from.id].push(to);

    if (!positions.has(from.id)) {
      positions.set(from.id, { x: 0, y: 0 });
    }
  });

  let currentX = 0;
  let currentY = 0;
  const nodeWidth = 100;
  const nodeHeight = 50;
  const horizontalSpacing = 150;
  const verticalSpacing = 100;

  Object.values(levels).forEach((nodes) => {
    currentX += nodeWidth + horizontalSpacing;

    nodes.forEach((node, index) => {
      if (!positions.has(node.id)) {
        currentY = index * (nodeHeight + verticalSpacing);
        positions.set(node.id, { x: currentX, y: currentY });
      }
    });

    currentY = 0;
  });

  return positions;
}

async function drawDiagram(diagram: DiagramElement[], positions: Map<string, { x: number; y: number }>): Promise<void> {
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
    const link = createLink(nodeShapes[from.id], nodeShapes[to.id], element.link); // Assuming you have the createLink function from the previous response
    figma.currentPage.appendChild(link);
  });
}
