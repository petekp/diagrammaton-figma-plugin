import { UI_HEIGHT, UI_WIDTH } from "./constants";
import {
  emit,
  once,
  on,
  showUI,
  loadSettingsAsync,
} from "@create-figma-plugin/utilities";

import {
  ExecutePlugin,
  GetSettings,
  HandleError,
  SetLoading,
  SetSelectedNodes,
  SetUILoaded,
} from "./types";

const SETTINGS_KEY = "mermaid-plugin";

const defaultSettings = {
  isFigJam: figma.editorType === "figjam",
};

function createNodeWithText(text: string, x: number, y: number): ShapeWithTextNode {
  const shape: ShapeWithTextNode = figma.createShapeWithText();
  shape.shapeType = 'SQUARE'; // You can choose other shape types based on your requirement
  shape.text.characters = text;
  shape.x = x;
  shape.y = y;
  return shape;
}



function createDiagram(parsedData: string[]) {
  const padding = 100;
  let currentX = padding;
  let currentY = padding;
  let lastNode: ShapeWithTextNode | null = null;
  
  parsedData.forEach((item, index) => {
    if (item !== "=>") {
      const node = figma.createShapeWithText();
      node.shapeType = "SQUARE";
      node.text.characters = item;
      node.resize(100, 50);
      node.x = currentX;
      node.y = currentY;

      if (lastNode) {
        const connector = figma.createConnector();
        connector.connectorStart = { endpointNodeId: lastNode.id, magnet: 'RIGHT' };
        connector.connectorEnd = { endpointNodeId: node.id, magnet: 'LEFT' };
        figma.currentPage.appendChild(connector);
      }

      figma.currentPage.appendChild(node);
      lastNode = node;
      currentX += node.width + padding;
    }
  });
}




export default function () {
  figma.on("selectionchange", () => {
    emit<SetSelectedNodes>(
      "SET_SELECTED_NODES",
      figma.currentPage.selection.length
    );
  });

  once<SetUILoaded>("SET_UI_LOADED", async function () {
    const settings = await loadSettingsAsync(defaultSettings, SETTINGS_KEY);
    emit<GetSettings>("GET_SETTINGS", settings);
  });

  on<ExecutePlugin>("EXECUTE_PLUGIN", async function ({ input }) {
    let currentPage = figma.currentPage;

    await figma.loadFontAsync({ family: "Inter", style: "Medium" })

    createDiagram(input);

    try {
      emit<SetLoading>("SET_LOADING", true);
    } catch (error: any) {
      emit<HandleError>("HANDLE_ERROR", error.message);
    } finally {
      emit<SetLoading>("SET_LOADING", false);
    }
  });

  showUI(
    {
      height: UI_HEIGHT,
      width: UI_WIDTH,
    },
    { defaultSettings }
  );
}
