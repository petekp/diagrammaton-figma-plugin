import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH } from "./constants";
import {
  DiagramElement,
  Position,
  Node,
  NodeLink,
  MagnetDirection,
} from "./types";

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

const deleteNodes = async (diagramId: string) => {
  const allNodes = figma.currentPage.findAll();
  const nodesToDelete = allNodes.filter(
    (node) => node.getPluginData("diagramId") === diagramId
  );

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
  stream,
  positionsObject,
  diagramId,
}: {
  diagram: DiagramElement[];
  stream?: boolean;
  positionsObject: { [key: string]: Position };
  diagramId: string;
}): Promise<void> => {
  const positions = new Map(Object.entries(positionsObject));
  const nodeShapes: { [id: string]: ShapeWithTextNode } = {};
  const links: SceneNode[] = [];
  const linkMap: Map<string, boolean> = new Map();
  const magnetMap: Map<string, { [key in MagnetDirection]: boolean }> =
    new Map();

  let backlinkCounter = 0;

  if (stream) {
    await deleteNodes(diagramId);
  }

  for (const { from, link, to } of diagram) {
    for (const node of [from, to]) {
      if (!nodeShapes[node.id]) {
        const position = positions.get(node.id);
        if (!position) {
          console.error(`No position provided for node: ${node.id}`);
          return;
        }

        nodeShapes[node.id] = await createNode({ node, position });
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

  Object.values(nodeShapes).forEach((node, i) => {
    setNodeProperties({ node, index: i, diagramData: diagram, diagramId });

    figma.currentPage.appendChild(node);
    node.visible = true;
  });
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
