import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH } from "./constants";
import {
  DiagramElement,
  Position,
  Node,
  NodeLink,
  MagnetDirection,
} from "./types";

const validShapes: ShapeWithTextNode["shapeType"][] = [
  "SQUARE",
  "ELLIPSE",
  "ROUNDED_RECTANGLE",
  "DIAMOND",
  "TRIANGLE_UP",
  "TRIANGLE_DOWN",
  "PARALLELOGRAM_RIGHT",
  "PARALLELOGRAM_LEFT",
  "ENG_DATABASE",
  "ENG_QUEUE",
  "ENG_FILE",
  "ENG_FOLDER",
];

const useServerMagnet = false;

const createNode = async ({
  node,
  position,
}: {
  node: Node;
  position: Position;
}): Promise<ShapeWithTextNode> => {
  const figmaNode = figma.createShapeWithText();
  figmaNode.visible = false;

  figmaNode.shapeType = validShapes.includes(node.shape)
    ? node.shape
    : "ROUNDED_RECTANGLE";

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

const deleteDiagramById = async (diagramId: string) => {
  const nodesToDelete = figma.currentPage
    .findAll()
    .filter((node) => node.getPluginData("diagramId") === diagramId);

  for (const node of nodesToDelete) {
    node.remove();
  }
};

const createLink = async ({
  from,
  to,
  link,
  fromMagnet,
  toMagnet,
  diagramId,
  diagramData,
}: {
  from: SceneNode;
  to: SceneNode;
  link: NodeLink;
  diagramId: string;
  fromMagnet: MagnetDirection;
  toMagnet: MagnetDirection;
  isBidirectional?: boolean;
  diagramData: string;
}): Promise<ConnectorNode> => {
  const connector = figma.createConnector();

  connector.setPluginData("diagramId", diagramId);
  connector.setPluginData("diagramData", diagramData);

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
  diagramId,
  stream,
}: {
  diagram: DiagramElement[];
  positionsObject: { [key: string]: Position };
  diagramId: string;
  stream?: boolean;
}): Promise<void> => {
  const positions = new Map(Object.entries(positionsObject));
  const nodeShapes: { [id: string]: ShapeWithTextNode } = {};
  const nodeIds: Map<ShapeWithTextNode, string> = new Map();
  const links: SceneNode[] = [];
  const linkMap: Map<string, boolean> = new Map();
  const magnetMap: Map<string, { [key in MagnetDirection]: boolean }> =
    new Map();

  let backlinkCounter = 0;

  if (stream) {
    await deleteDiagramById(diagramId);
  }

  for (const { from, link, to } of diagram) {
    for (const node of [from, to]) {
      if (!nodeShapes[node.id]) {
        const position = positions.get(node.id);
        if (!position) {
          console.error(`No position provided for node: ${node.id}`);
          return;
        }

        const figmaNode = await createNode({ node, position });
        nodeShapes[node.id] = figmaNode;
        nodeIds.set(figmaNode, node.id); // Store the node ID in nodeIds

        magnetMap.set(node.id, {
          TOP: false,
          RIGHT: false,
          BOTTOM: false,
          LEFT: false,
        });
      }
    }

    if (nodeShapes[from.id] && nodeShapes[to.id]) {
      linkMap.set(`${from.id}-${to.id}`, true);
      const isBidirectional = linkMap.has(`${to.id}-${from.id}`);

      let fromMagnet: MagnetDirection;
      let toMagnet: MagnetDirection = "LEFT";

      if (useServerMagnet) {
        fromMagnet = link.fromMagnet || "RIGHT";
        toMagnet = link.toMagnet || "LEFT";
      } else {
        if (isBidirectional) {
          backlinkCounter += 1;
          fromMagnet = backlinkCounter % 2 === 0 ? "TOP" : "BOTTOM";
        } else {
          const fromMagnetMap = magnetMap.get(from.id);
          fromMagnet =
            fromMagnetMap && !fromMagnetMap["RIGHT"] ? "RIGHT" : "BOTTOM";
          if (fromMagnetMap) fromMagnetMap[fromMagnet] = true;
        }
      }

      links.push(
        await createLink({
          from: nodeShapes[from.id],
          to: nodeShapes[to.id],
          link,
          diagramId,
          fromMagnet,
          toMagnet,
          diagramData: JSON.stringify(diagram),
        })
      );
    }
  }

  links.forEach((link) => figma.currentPage.appendChild(link));

  const bufferNode = figma.createRectangle();
  bufferNode.opacity = 0;

  const { maxX, maxY } = getMaxXY(positionsObject);
  const diagramWidth = maxX;
  const diagramHeight = maxY;
  const { x: newDiagramX, y: newDiagramY } = getEmptySpaceCoordinates();

  Object.values(nodeShapes).forEach((node, i) => {
    setNodeProperties({ node, index: i, diagramData: diagram, diagramId });
    figma.currentPage.appendChild(node);

    const nodeId = nodeIds.get(node)!;
    const originalPosition = positionsObject[nodeId];

    if (originalPosition) {
      node.x = originalPosition.x + newDiagramX;
      node.y = originalPosition.y + newDiagramY;
    }

    node.visible = true;
  });

  bufferNode.resize(diagramWidth * 1.5, diagramHeight);
  bufferNode.x = newDiagramX;
  bufferNode.y = newDiagramY;

  figma.viewport.scrollAndZoomIntoView([bufferNode]);
  bufferNode.remove();
};

const setNodeProperties = ({
  node,
  index,
  diagramId,
  diagramData,
}: {
  node: ShapeWithTextNode;
  index: number;
  diagramId: string;
  diagramData?: DiagramElement[];
}) => {
  // setRelaunchButton(node, "expand", {
  //   description: "Expand into more granular steps",
  // });

  // setRelaunchButton(node, "collapse", {
  //   description: "Collapse into less granular steps",
  // });

  if (index === 0) {
    node.setPluginData("isRoot", "true");
  }

  if (diagramData) {
    node.setPluginData("diagramData", JSON.stringify(diagramData));
    node.setPluginData("diagramId", diagramId);
  }
};

function getMaxXY(positionsObject: { [key: string]: Position }) {
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const position of Object.values(positionsObject)) {
    const potentialMaxX = position.x + DEFAULT_NODE_WIDTH;
    const potentialMaxY = position.y + DEFAULT_NODE_HEIGHT;

    if (potentialMaxX > maxX) {
      maxX = potentialMaxX;
    }

    if (potentialMaxY > maxY) {
      maxY = potentialMaxY;
    }
  }

  return { maxX, maxY };
}

function getEmptySpaceCoordinates() {
  const existingNodes = figma.currentPage.findAll();
  let maxY = 0;

  for (const node of existingNodes) {
    const box = node.absoluteBoundingBox;
    if (box) {
      maxY = Math.max(maxY, box.y + box.height);
    }
  }

  const offset = 100; // Change this to the desired offset
  const newDiagramY = maxY + offset;

  return { x: 0, y: newDiagramY };
}
