import { DiagramElement, Position, Node, NodeLink } from "./types";

const createNode = (node: Node, position: Position): FrameNode => {
  const figmaNode = figma.createShapeWithText();
  figmaNode.shapeType = node.shape;
  figmaNode.fills = [
    { type: "SOLID", color: { r: 0.59, g: 0.278, b: 1 }, opacity: 1 },
  ];
  figmaNode.text.characters = node.label || "";
  figmaNode.resize(180, 85);
  const frame = figma.createFrame();
  frame.appendChild(figmaNode);
  frame.x = position.x;
  frame.y = position.y;
  frame.resize(180, 85);
  return frame;
};

const createLink = (
  from: SceneNode,
  to: SceneNode,
  link: NodeLink
): ConnectorNode => {
  const connector = figma.createConnector(),
    fromPosition = from.relativeTransform[0][2],
    toPosition = to.relativeTransform[0][2];
  const fromMagnet =
    fromPosition === toPosition
      ? "BOTTOM"
      : fromPosition < toPosition
      ? "RIGHT"
      : "LEFT";
  const toMagnet =
    fromPosition === toPosition
      ? "TOP"
      : fromPosition < toPosition
      ? "LEFT"
      : "RIGHT";
  connector.connectorStart = { endpointNodeId: from.id, magnet: fromMagnet };
  connector.connectorEnd = { endpointNodeId: to.id, magnet: toMagnet };
  if (link.label) {
    connector.text.characters = link.label || "";
    connector.textBackground.fills = [
      { type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.2 },
    ];
  }
  return connector;
};

export const drawDiagram = async ({
  diagram,
  positionsObject,
}: {
  diagram: DiagramElement[];
  positionsObject: { [key: string]: Position };
}): Promise<void> => {
  const positions = new Map(Object.entries(positionsObject)),
    nodeShapes: { [id: string]: FrameNode } = {},
    links: SceneNode[] = [];
  diagram.forEach(({ from, link, to }) => {
    [from, to].forEach((node) => {
      if (!nodeShapes[node.id]) {
        const position = positions.get(node.id);
        if (!position) {
          console.error(`No position provided for node: ${node.id}`);
          return;
        }
        nodeShapes[node.id] = createNode(node, position);
      }
    });
    if (nodeShapes[from.id] && nodeShapes[to.id])
      links.push(createLink(nodeShapes[from.id], nodeShapes[to.id], link));
  });
  links.forEach((link) => figma.currentPage.appendChild(link));
  Object.values(nodeShapes).forEach((node) =>
    figma.currentPage.appendChild(node)
  );
  figma.notify("Diagram drawn successfully");
};
