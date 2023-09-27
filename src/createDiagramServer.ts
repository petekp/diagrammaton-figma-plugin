import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH } from "./constants";
import {
  DiagramElement,
  Position,
  Node,
  NodeLink,
  MagnetDirection,
} from "./types";
import { generateTimeBasedUUID } from "./util";

const useServerMagnet = false;

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
  fromMagnet,
  toMagnet,
  isBidirectional,
}: {
  from: SceneNode;
  to: SceneNode;
  link: NodeLink;
  diagramId: string;
  fromMagnet: MagnetDirection;
  toMagnet: MagnetDirection;
  isBidirectional?: boolean;
}): Promise<ConnectorNode> => {
  const connector = figma.createConnector();

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
}: {
  diagram: DiagramElement[];
  positionsObject: { [key: string]: Position };
}): Promise<void> => {
  const diagramId = generateTimeBasedUUID();
  const positions = new Map(Object.entries(positionsObject));
  const nodeShapes: { [id: string]: ShapeWithTextNode } = {};
  const links: SceneNode[] = [];
  const linkMap: Map<string, boolean> = new Map();
  const magnetMap: Map<string, { [key in MagnetDirection]: boolean }> =
    new Map();

  let backlinkCounter = 0;

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
        })
      );
    }
  }

  links.forEach((link) => figma.currentPage.appendChild(link));

  Object.values(nodeShapes).forEach((node, i) => {
    setNodeProperties({ node, index: i, pluginData: diagram, diagramId });

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
  pluginData?: DiagramElement[];
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

  if (pluginData) {
    node.setPluginData("diagramData", JSON.stringify(pluginData));
    node.setPluginData("diagramId", diagramId);
  }
};
