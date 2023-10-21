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

const createNode = ({
  node,
  position,
}: {
  node: Node;
  position: Position;
}): ShapeWithTextNode => {
  const figmaNode = figma.createShapeWithText();
  figmaNode.visible = false;

  figmaNode.shapeType = validShapes.includes(node.shape)
    ? node.shape
    : "ROUNDED_RECTANGLE";

  figmaNode.fills = [
    { type: "SOLID", color: { r: 0.59, g: 0.278, b: 1 }, opacity: 1 },
  ];

  if (node.label) {
    figmaNode.text.characters = node.label || "";
  }

  figmaNode.resize(DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT);

  figmaNode.x = position.x;
  figmaNode.y = position.y;

  return figmaNode;
};

const deleteDiagramById = (diagramId: string) => {
  const nodesToDelete = figma.currentPage
    .findAll()
    .filter((node) => node.getPluginData("diagramId") === diagramId);

  for (const node of nodesToDelete) {
    node.remove();
  }
};

const createLink = ({
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
}): ConnectorNode => {
  const connector = figma.createConnector();

  connector.setPluginData("diagramId", diagramId);
  connector.setPluginData("diagramData", diagramData);

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

const prepareData = (positionsObject: Record<string, Position>) => {
  const positions = new Map(Object.entries(positionsObject));
  const nodeShapes: Record<string, ShapeWithTextNode> = {};
  const nodeIds: Map<ShapeWithTextNode, string> = new Map();
  const links: SceneNode[] = [];
  const linkMap: Map<string, boolean> = new Map();
  const magnetMap: Map<string, Record<MagnetDirection, boolean>> = new Map();

  return { positions, nodeShapes, nodeIds, links, linkMap, magnetMap };
};

const deleteExistingDiagram = (diagramId: string) => {
  deleteDiagramById(diagramId);
};

const createDiagramNodes = (
  diagram: DiagramElement[],
  positions: Map<string, Position>,
  nodeShapes: { [id: string]: ShapeWithTextNode },
  nodeIds: Map<ShapeWithTextNode, string>,
  magnetMap: Map<string, { [key in MagnetDirection]: boolean }>
) => {
  for (const { from, to } of diagram) {
    for (const node of [from, to]) {
      if (!nodeShapes[node.id]) {
        const position = positions.get(node.id);
        if (!position) {
          console.error(`No position provided for node: ${node.id}`);
          return;
        }

        const figmaNode = createNode({ node, position });
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
  }
};

const createDiagramLinks = (
  diagram: DiagramElement[],
  nodeShapes: { [id: string]: ShapeWithTextNode },
  links: SceneNode[],
  linkMap: Map<string, boolean>,
  magnetMap: Map<string, { [key in MagnetDirection]: boolean }>,
  diagramId: string
) => {
  let backlinkCounter = 0;

  for (const { from, link, to } of diagram) {
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
        createLink({
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
};

const positionNodes = (
  nodeShapes: { [id: string]: ShapeWithTextNode },
  positionsObject: { [key: string]: Position },
  diagram: DiagramElement[],
  diagramId: string,
  nodeIds: Map<ShapeWithTextNode, string>
) => {
  const { x: newDiagramX, y: newDiagramY } = getEmptySpaceCoordinates();

  Object.values(nodeShapes).forEach((shapeNode, i) => {
    const diagramNodeId = nodeIds.get(shapeNode)!;

    const nodeProperties = {
      shapeNode,
      index: i,
      diagramNodeId,
      diagramId,
      diagramData: diagram,
    };

    setNodeProperties(nodeProperties);

    const originalPosition = positionsObject[diagramNodeId];
    if (originalPosition) {
      shapeNode.x = Math.round(originalPosition.x + newDiagramX);
      shapeNode.y = Math.round(originalPosition.y + newDiagramY);
    }

    figma.currentPage.appendChild(shapeNode);
    shapeNode.visible = true;
  });
};

const createAndPositionBufferNode = (positionsObject: {
  [key: string]: Position;
}) => {
  const bufferNode = figma.createRectangle();
  bufferNode.opacity = 0;

  const { maxX, maxY } = getMaxXY(positionsObject);
  const diagramWidth = Math.round(maxX);
  const diagramHeight = Math.round(maxY);
  const { x: newDiagramX, y: newDiagramY } = getEmptySpaceCoordinates();

  bufferNode.resize(diagramWidth * 1.5, diagramHeight);
  bufferNode.x = newDiagramX;
  bufferNode.y = newDiagramY;

  figma.viewport.scrollAndZoomIntoView([bufferNode]);
  bufferNode.remove();

  return { bufferNode, newDiagramX, newDiagramY };
};

const addLinksToDiagram = (links: SceneNode[]) => {
  links.forEach((link) => {
    link.visible = false;
    figma.currentPage.appendChild(link);
    link.visible = true;
  });
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
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  const { positions, nodeShapes, nodeIds, links, linkMap, magnetMap } =
    prepareData(positionsObject);

  if (stream) deleteExistingDiagram(diagramId);

  createDiagramNodes(diagram, positions, nodeShapes, nodeIds, magnetMap);
  createDiagramLinks(diagram, nodeShapes, links, linkMap, magnetMap, diagramId);
  positionNodes(nodeShapes, positionsObject, diagram, diagramId, nodeIds);
  createAndPositionBufferNode(positionsObject);
  addLinksToDiagram(links);
  centerViewportOnDiagram(nodeShapes);
};

const setNodeProperties = ({
  index,
  shapeNode,
  diagramNodeId,
  diagramId,
  diagramData,
}: {
  index: number;
  shapeNode: ShapeWithTextNode;
  diagramNodeId: string;
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
    shapeNode.setPluginData("isRoot", "true");
  }

  if (diagramData) {
    shapeNode.setPluginData("diagramNodeId", diagramNodeId);
    shapeNode.setPluginData("diagramId", diagramId);
    shapeNode.setPluginData("diagramData", JSON.stringify(diagramData));
  }
};

function getMaxXY(positionsObject: { [key: string]: Position }) {
  let maxX = 0;
  let maxY = 0;

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

  const viewportCenterY = figma.viewport.center.y;
  const newDiagramY = Math.round(Math.max(maxY, viewportCenterY));

  return { x: 0, y: newDiagramY };
}

const centerViewportOnDiagram = (nodeShapes: {
  [id: string]: ShapeWithTextNode;
}) => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  Object.values(nodeShapes).forEach((node) => {
    const box = node.absoluteBoundingBox;
    if (!box) return;
    minX = Math.min(minX, box.x);
    minY = Math.min(minY, box.y);
    maxX = Math.max(maxX, box.x + box.width);
    maxY = Math.max(maxY, box.y + box.height);
  });

  const viewportWidth = figma.viewport.bounds.width;
  const padding = Math.round(viewportWidth / 4); // Padding is a third of the viewport width

  const tempNode = figma.createRectangle();
  tempNode.x = minX;
  tempNode.y = minY;
  tempNode.resize(maxX - minX + padding, maxY - minY); // Add padding to the width

  const bufferNode = figma.createRectangle();
  bufferNode.x = maxX + padding; // Position the buffer node to the right of the diagram
  bufferNode.y = minY;
  bufferNode.resize(padding, maxY - minY); // The width of the buffer node is the desired padding
  bufferNode.opacity = 0; // Make the buffer node invisible

  figma.viewport.scrollAndZoomIntoView([tempNode, bufferNode]);
  tempNode.remove();
  bufferNode.remove();
};
