import { DiagramElement, Position, Node, NodeLink } from "./types";

function createNode(node: Node, position: Position): FrameNode {
  const figmaNode = figma.createShapeWithText();

  figmaNode.shapeType = node.shape;
  figmaNode.text.characters = node.label || "";
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

  let fromMagnet: ConnectorEndpointEndpointNodeIdAndMagnet["magnet"],
    toMagnet: ConnectorEndpointEndpointNodeIdAndMagnet["magnet"];

  if (fromPosition === toPosition) {
    // same x
    fromMagnet = "BOTTOM";
    toMagnet = "TOP";
  } else if (fromPosition < toPosition) {
    // left to right
    fromMagnet = "RIGHT";
    toMagnet = "LEFT";
  } else {
    // right to left
    fromMagnet = "LEFT";
    toMagnet = "RIGHT";
  }

  connector.connectorStart = { endpointNodeId: from.id, magnet: fromMagnet };
  connector.connectorEnd = { endpointNodeId: to.id, magnet: toMagnet };

  if (link.label || link.condition) {
    const text = connector.text;
    const textBackground = connector.textBackground;

    let label = link.label || "";
    if (link.condition) {
      label = `${link.condition}`;
    }

    text.characters = label;
    textBackground.fills = [
      { type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.2 },
    ];
  }

  return connector;
}

export async function drawDiagram({
  diagram,
  positionsObject,
}: {
  diagram: DiagramElement[];
  positionsObject: { [key: string]: Position };
}): Promise<void> {
  const positions = new Map(Object.entries(positionsObject));

  const nodeShapes: { [id: string]: FrameNode } = {};
  const links: SceneNode[] = [];

  // Create nodes and edges
  diagram.forEach((element) => {
    const { from, to } = element;

    [from, to].forEach((node) => {
      if (!nodeShapes[node.id]) {
        const position = positions.get(node.id);
        if (!position) {
          console.error(`No position provided for node: ${node.id}`);
          return;
        }

        const frame = createNode(node, position);
        nodeShapes[node.id] = frame;
      }
    });

    if (nodeShapes[from.id] && nodeShapes[to.id]) {
      const link = createLink(
        nodeShapes[from.id],
        nodeShapes[to.id],
        element.link
      );
      links.push(link);
    }
  });

  // Append elements to the page in the correct order
  links.forEach((link) => figma.currentPage.appendChild(link));
  Object.values(nodeShapes).forEach((node) =>
    figma.currentPage.appendChild(node)
  );

  figma.notify("Diagram drawn successfully");
}
