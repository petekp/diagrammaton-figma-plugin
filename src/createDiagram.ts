import { Diagram, Edge } from "./diagramming-types";

export type Layer = Node[];

export type LayeredDiagram = {
  id: string;
  layers: Array<Layer>;
  edges: Array<Edge>;
};

export type LayerMap = { [id: string]: number };




function assignLayers(diagram: Diagram): LayeredDiagram {
  let layerMap: LayerMap = {};
  let layers: Layer[] = [];

  for (let node of diagram.nodes) {
    let maxLayer = 0;
    for (let edge of diagram.edges) {
      if (edge.endNodeId === node.id) {
        maxLayer = Math.max(maxLayer, layerMap[edge.startNodeId] + 1);
      }
    }
    layerMap[node.id] = maxLayer;
    if (!layers[maxLayer]) {
      layers[maxLayer] = [];
    }
    layers[maxLayer].push(node);
  }

  return {
    id: diagram.id,
    layers: layers,
    edges: diagram.edges,
  };
}


function orderNodes(layeredDiagram: LayeredDiagram): LayeredDiagram {
  let layers = [...layeredDiagram.layers];

  // Implement your preferred node ordering algorithm here.
  // This could be as simple as sorting nodes based on the number of incoming and outgoing edges,
  // or a more complex algorithm like the barycenter method.

  return {
    id: layeredDiagram.id,
    layers: layers,
    edges: layeredDiagram.edges,
  };
}


function layoutDiagram(diagram: Diagram): LayeredDiagram {
  let layeredDiagram = assignLayers(diagram);
  return orderNodes(layeredDiagram);
}



export function createDiagram(parsedData: any[]) {
  const padding = 100;
  let currentX = padding;
  let currentY = padding;
  let nodes: {[key: string]: ShapeWithTextNode} = {};

  parsedData.forEach((item) => {
    if (typeof item === "string") {
      const node = figma.createShapeWithText();
      node.shapeType = "SQUARE";
      node.text.characters = item;
      node.resize(100, 50);
      node.x = currentX;
      node.y = currentY;
      figma.currentPage.appendChild(node);

      nodes[item] = node;  // store node in dictionary for future reference

      currentX += node.width + padding;
    } else if (Array.isArray(item)) {
      // item is an edge represented as a tuple
      const [startNodeId, endNodeId] = item;
      const startNode = nodes[startNodeId];
      const endNode = nodes[endNodeId];

      if (startNode && endNode) {
        const connector = figma.createConnector();
        connector.connectorStart = { endpointNodeId: startNode.id, magnet: 'RIGHT' };
        connector.connectorEnd = { endpointNodeId: endNode.id, magnet: 'LEFT' };
        figma.currentPage.appendChild(connector);
      }
    }
  });
}
