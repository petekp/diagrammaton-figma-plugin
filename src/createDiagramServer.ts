import { setRelaunchButton } from "@create-figma-plugin/utilities";

import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH } from "./constants";
import { DiagramElement, Position, Node, NodeLink } from "./types";
import { generateTimeBasedUUID } from "./util";

const NodeSize: { [k in Node["shape"]]: { width: number; height: number } } = {
  SQUARE: { width: 300, height: 300 },
  ELLIPSE: { width: 180, height: 85 },
  ROUNDED_RECTANGLE: { width: 180, height: 85 },
  DIAMOND: { width: 180, height: 85 },
  TRIANGLE_UP: { width: 180, height: 85 },
  TRIANGLE_DOWN: { width: 180, height: 85 },
  PARALLELOGRAM_LEFT: { width: 180, height: 85 },
  PARALLELOGRAM_RIGHT: { width: 180, height: 85 },
  ENG_DATABASE: { width: 200, height: 150 },
  ENG_QUEUE: { width: 180, height: 85 },
  ENG_FILE: { width: 180, height: 85 },
  ENG_FOLDER: { width: 180, height: 85 },
};

const createNode = async ({
  node,
  position,
}: {
  node: Node;
  position: Position;
}): Promise<ShapeWithTextNode> => {
  const figmaNode = figma.createShapeWithText();
  figmaNode.shapeType = node.shape;
  figmaNode.fills = [
    { type: "SOLID", color: { r: 0.59, g: 0.278, b: 1 }, opacity: 1 },
  ];

  if (node.label) {
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    figmaNode.text.characters = node.label || "";
  }

  figmaNode.resize(DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT);

  figmaNode.x = position.x;
  figmaNode.y = position.y;

  return figmaNode;
};

const createLink = async ({
  from,
  to,
  link,
  diagramId,
}: {
  from: SceneNode;
  to: SceneNode;
  link: NodeLink;
  diagramId: string;
}): Promise<ConnectorNode> => {
  const connector = figma.createConnector();
  const fromPosition = from.relativeTransform[0][2];
  const toPosition = to.relativeTransform[0][2];
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
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
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
  pluginData,
}: {
  diagram: DiagramElement[];
  positionsObject: { [key: string]: Position };
  pluginData?: string;
}): Promise<void> => {
  const diagramId = generateTimeBasedUUID();
  const positions = new Map(Object.entries(positionsObject));
  const nodeShapes: { [id: string]: ShapeWithTextNode } = {};
  const links: SceneNode[] = [];

  for (const { from, link, to } of diagram) {
    for (const node of [from, to]) {
      if (!nodeShapes[node.id]) {
        const position = positions.get(node.id);
        if (!position) {
          console.error(`No position provided for node: ${node.id}`);
          return;
        }
        nodeShapes[node.id] = await createNode({ node, position });
      }
    }

    if (nodeShapes[from.id] && nodeShapes[to.id]) {
      links.push(
        await createLink({
          from: nodeShapes[from.id],
          to: nodeShapes[to.id],
          link,
          diagramId,
        })
      );
    }
  }

  links.forEach((link) => figma.currentPage.appendChild(link));

  Object.values(nodeShapes).forEach((node, i) => {
    setNodeProperties({ node, index: i, pluginData, diagramId });

    figma.currentPage.appendChild(node);
  });

  figma.notify("Diagram generated!");
};

const setNodeProperties = ({
  node,
  index,
  diagramId,
  pluginData,
}: {
  node: ShapeWithTextNode;
  index: number;
  diagramId: string;
  pluginData?: string;
}) => {
  setRelaunchButton(node, "expand", {
    description: "Expand into more granular steps",
  });

  setRelaunchButton(node, "collapse", {
    description: "Collapse into less granular steps",
  });

  if (index === 0) {
    node.setPluginData("isRoot", "true");
  }

  if (pluginData) {
    node.setPluginData("syntax", pluginData);
    node.setPluginData("diagramId", diagramId);
  }
};
