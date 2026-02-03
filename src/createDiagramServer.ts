import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH } from "./constants";
import {
  DiagramElement,
  Position,
  Node,
  NodeLink,
  MagnetDirection,
} from "./types";
import nodeStyles from "./nodeStyles";

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

const USE_SERVER_MAGNET = true;

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

  setNodeColors({ node, figmaNode });

  if (node.label) {
    figmaNode.text.characters = node.label || "";
  }

  figmaNode.resize(DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT);

  figmaNode.x = position.x;
  figmaNode.y = position.y;

  return figmaNode;
};

const setNodeColors = ({
  node,
  figmaNode,
}: {
  node: Node;
  figmaNode: ShapeWithTextNode;
}) => {
  if (
    /error|invalid|fail|incomplete|reject|denied|unsuccessful|fault|loss|decline|defeat|cancel|terminate/i.test(
      node.label
    )
  ) {
    figmaNode.fills = nodeStyles.negative.fill;
    figmaNode.text.fills = nodeStyles.negative.text;
    figmaNode.strokes = nodeStyles.negative.stroke;
  } else if (
    /success|succeed|validated|passed|approved|confirmed|achieved|accepted|secured|verified/i.test(
      node.label
    ) &&
    !/\?/.test(node.label)
  ) {
    figmaNode.fills = nodeStyles.positive.fill;
    figmaNode.text.fills = nodeStyles.positive.text;
    figmaNode.strokes = nodeStyles.positive.stroke;
  } else if (/\?/i.test(node.label) || node.shape === "DIAMOND") {
    figmaNode.fills = nodeStyles.decision.fill;
    figmaNode.text.fills = nodeStyles.decision.text;
    figmaNode.strokes = nodeStyles.decision.stroke;
  } else {
    figmaNode.fills = nodeStyles.default.fill;
    figmaNode.text.fills = nodeStyles.default.text;
    figmaNode.strokes = nodeStyles.default.stroke;
  }
};

const deleteDiagramById = (diagramId: string) => {
  // With dynamic page loading, we need to get current page reference explicitly
  const currentPage = figma.currentPage;
  const nodesToDelete = currentPage.findAll((node) =>
    node.getPluginData("diagramId") === diagramId
  );

  // Remove connectors first to avoid transient removal of endpoints
  const connectors: SceneNode[] = [];
  const others: SceneNode[] = [];
  for (const n of nodesToDelete) {
    if ((n as SceneNode).type === "CONNECTOR") connectors.push(n as SceneNode);
    else others.push(n as SceneNode);
  }

  const safeRemove = (node: SceneNode) => {
    try {
      if (figma.getNodeById(node.id)) node.remove();
    } catch {
      // Node may already be removed by Figma due to dependency cleanup; ignore
    }
  };

  connectors.forEach(safeRemove);
  others.forEach(safeRemove);
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
  link: NodeLink | undefined;
  diagramId: string;
  fromMagnet: MagnetDirection;
  toMagnet: MagnetDirection;
  isBidirectional?: boolean;
  diagramData: string;
}): ConnectorNode => {
  const connector = figma.createConnector();

  connector.setPluginData("diagramId", diagramId);
  connector.setPluginData("diagramData", diagramData);
  if ((from as SceneNode).getPluginData) {
    connector.setPluginData("fromId", (from as SceneNode).getPluginData("diagramNodeId"));
  }
  if ((to as SceneNode).getPluginData) {
    connector.setPluginData("toId", (to as SceneNode).getPluginData("diagramNodeId"));
  }

  connector.connectorStart = { endpointNodeId: from.id, magnet: fromMagnet };
  connector.connectorEnd = { endpointNodeId: to.id, magnet: toMagnet };

  if (link?.label) {
    connector.text.characters = link.label || "";

    if (/yes/i.test(link.label)) {
      connector.textBackground.fills = nodeStyles.positive.fill;
      connector.text.fills = nodeStyles.positive.text;
    } else if (/no/i.test(link.label)) {
      connector.textBackground.fills = nodeStyles.negative.fill;
      connector.text.fills = nodeStyles.negative.text;
    } else {
      connector.textBackground.fills = [
        { type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.2 },
      ];
    }
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

const createDiagramNodes = ({
  diagram,
  positions,
  nodeShapes,
  nodeIds,
  magnetMap,
  existingNodes,
}: {
  diagram: DiagramElement[];
  positions: Map<string, Position>;
  nodeShapes: { [id: string]: ShapeWithTextNode };
  nodeIds: Map<ShapeWithTextNode, string>;
  magnetMap: Map<string, { [key in MagnetDirection]: boolean }>;
  existingNodes?: Map<string, ShapeWithTextNode>;
}) => {
  for (const { from, to } of diagram) {
    for (const node of [from, to]) {
      if (!nodeShapes[node.id]) {
        const position = positions.get(node.id);
        if (!position) {
          console.error(`No position provided for node: ${node.id}`);
          return;
        }

        const existing = existingNodes?.get(node.id);
        const figmaNode = existing ?? createNode({ node, position });
        // Always update visual props/position on existing nodes as well
        figmaNode.shapeType = validShapes.includes(node.shape)
          ? node.shape
          : "ROUNDED_RECTANGLE";
        setNodeColors({ node, figmaNode });
        if (node.label && figmaNode.text) {
          figmaNode.text.characters = node.label || "";
        }
        figmaNode.x = position.x;
        figmaNode.y = position.y;

        nodeShapes[node.id] = figmaNode;
        nodeIds.set(figmaNode, node.id);

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

const createDiagramLinks = ({
  diagram,
  nodeShapes,
  links,
  linkMap,
  magnetMap,
  diagramId,
  existingConnectors,
}: {
  diagram: DiagramElement[];
  nodeShapes: { [id: string]: ShapeWithTextNode };
  links: SceneNode[];
  linkMap: Map<string, boolean>;
  magnetMap: Map<string, { [key in MagnetDirection]: boolean }>;
  diagramId: string;
  existingConnectors?: Map<string, ConnectorNode>;
}) => {
  let backlinkCounter = 0;

  for (const { from, link, to } of diagram) {
    if (nodeShapes[from.id] && nodeShapes[to.id]) {
      linkMap.set(`${from.id}-${to.id}`, true);
      const isBidirectional = linkMap.has(`${to.id}-${from.id}`);

      let fromMagnet: MagnetDirection = "RIGHT";
      let toMagnet: MagnetDirection = "LEFT";

      if (USE_SERVER_MAGNET) {
        if (link) {
          fromMagnet = link.fromMagnet || "RIGHT";
          toMagnet = link.toMagnet || "LEFT";
        }
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
      const edgeKey = `${from.id}->${to.id}`;
      const existing = existingConnectors?.get(edgeKey);
      if (existing) {
        existing.connectorStart = {
          endpointNodeId: nodeShapes[from.id].id,
          magnet: fromMagnet,
        };
        existing.connectorEnd = {
          endpointNodeId: nodeShapes[to.id].id,
          magnet: toMagnet,
        };
        if (link?.label) existing.text.characters = link.label;
        links.push(existing);
      } else {
        const conn = createLink({
          from: nodeShapes[from.id],
          to: nodeShapes[to.id],
          link,
          diagramId,
          fromMagnet,
          toMagnet,
          diagramData: JSON.stringify(diagram),
        });
        conn.setPluginData("fromId", from.id);
        conn.setPluginData("toId", to.id);
        links.push(conn);
      }
    }
  }
};

const positionNodes = ({
  nodeShapes,
  positionsObject,
  diagram,
  diagramId,
  nodeIds,
}: {
  nodeShapes: { [id: string]: ShapeWithTextNode };
  positionsObject: { [key: string]: Position };
  diagram: DiagramElement[];
  diagramId: string;
  nodeIds: Map<ShapeWithTextNode, string>;
}) => {
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

    // With dynamic page loading, get explicit page reference
    const currentPage = figma.currentPage;
    currentPage.appendChild(shapeNode);
    shapeNode.visible = true;
  });
};

const createAndPositionBufferNode = (positionsObject: {
  [key: string]: Position;
}) => {
  // Calculate diagram bounds but don't zoom - just return positioning info
  const { x: newDiagramX, y: newDiagramY } = getEmptySpaceCoordinates();

  return { newDiagramX, newDiagramY };
};

const addLinksToDiagram = (links: SceneNode[]) => {
  // With dynamic page loading, get explicit page reference
  const currentPage = figma.currentPage;
  links.forEach((link) => {
    link.visible = false;
    currentPage.appendChild(link);
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

  // First chunk: start fresh
  if (stream) deleteExistingDiagram(diagramId);

  // Build maps of existing nodes/connectors for in-place updates
  const currentPage = figma.currentPage;
  const existingNodesMap = new Map<string, ShapeWithTextNode>();
  const existingConnectorsMap = new Map<string, ConnectorNode>();
  currentPage.findAll((n) => n.getPluginData("diagramId") === diagramId).forEach((n) => {
    if (n.type === "SHAPE_WITH_TEXT") {
      const key = (n as SceneNode).getPluginData("diagramNodeId");
      if (key) existingNodesMap.set(key, n as ShapeWithTextNode);
    } else if (n.type === "CONNECTOR") {
      const fromId = (n as SceneNode).getPluginData("fromId");
      const toId = (n as SceneNode).getPluginData("toId");
      if (fromId && toId) existingConnectorsMap.set(`${fromId}->${toId}`, n as ConnectorNode);
    }
  });

  createDiagramNodes({
    diagram,
    positions,
    nodeShapes,
    nodeIds,
    magnetMap,
    existingNodes: existingNodesMap,
  });

  createDiagramLinks({
    diagram,
    nodeShapes,
    links,
    linkMap,
    magnetMap,
    diagramId,
    existingConnectors: existingConnectorsMap,
  });
  // Remove connectors that are no longer part of the diagram
  for (const [key, conn] of existingConnectorsMap.entries()) {
    if (!linkMap.get(key)) {
      try {
        if (figma.getNodeById(conn.id)) conn.remove();
      } catch {}
    }
  }
  positionNodes({ nodeShapes, positionsObject, diagram, diagramId, nodeIds });
  createAndPositionBufferNode(positionsObject);
  addLinksToDiagram(links);

  // Center on the most recently created node
  const nodeIdsArray = Object.keys(nodeShapes);
  if (nodeIdsArray.length > 0) {
    const lastNodeId = nodeIdsArray[nodeIdsArray.length - 1];
    const lastNode = nodeShapes[lastNodeId];
    if (lastNode) {
      centerViewportOnNode(lastNode);
    }
  }

  // Remove nodes that are no longer present
  const desiredIds = new Set(Object.keys(nodeShapes));
  for (const [id, node] of existingNodesMap.entries()) {
    if (!desiredIds.has(id)) {
      try {
        if (figma.getNodeById(node.id)) node.remove();
      } catch {}
    }
  }
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
  // With dynamic page loading, we need to get current page reference explicitly
  const currentPage = figma.currentPage;
  const existingNodes = currentPage.findAll();
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

const centerViewportOnNode = (node: ShapeWithTextNode) => {
  const box = node.absoluteBoundingBox;
  if (!box) return;

  // Set a consistent zoom level that's good for reading nodes
  const readableZoom = 0.8; // 80% zoom - readable but not too zoomed in
  figma.viewport.zoom = readableZoom;

  // Calculate the center point of the node
  const nodeCenterX = box.x + box.width / 2;
  const nodeCenterY = box.y + box.height / 2;

  // Account for plugin UI offset (right side panel)
  const pluginUIOffset = 0; // Approximate width of plugin panel
  const adjustedCenterX = nodeCenterX - pluginUIOffset / 2;

  // Set viewport center directly (this respects our zoom setting)
  figma.viewport.center = { x: adjustedCenterX, y: nodeCenterY };
};
