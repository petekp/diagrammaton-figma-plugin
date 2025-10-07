import { UI_HEIGHT, UI_WIDTH } from "./constants";
import {
  emit,
  once,
  on,
  showUI,
  loadSettingsAsync,
  saveSettingsAsync,
} from "@create-figma-plugin/utilities";

import {
  DrawDiagram,
  GetPersistedState,
  HandleError,
  SetSelectedNodesCount,
  SetUILoaded,
  PersistedState,
  SavePersistedState,
  SetSelectedNodeData,
  EndDraw,
} from "./types";

import { drawDiagram } from "./createDiagramServer";

// Track which diagrams have been cleared once per streaming session
const clearedDiagramIds = new Set<string>();

const SETTINGS_KEY = "figjam-diagrammaton-plugin";

export const defaultSettings: PersistedState = {
  customPrompt: "",
  feedback: "",
  isFigJam: figma.editorType === "figjam",
  isNewUser: true,
  isSignInVisible: false,
  licenseKey: "",
  model: "gpt5",
  naturalInput: "",
  orientation: "LR",
  showSuggestions: true,
  modifyInput: "",
  textareaFontSizeById: {},
};

export default function () {
  figma.on("selectionchange", () => {
    // Get the current selection - this works with dynamic page loading
    const selection = figma.currentPage.selection;
    const firstSelectedNode = selection[0];

    if (firstSelectedNode) {
      emit<SetSelectedNodeData>("SET_SELECTED_NODE_DATA", {
        diagramNodeId: firstSelectedNode.getPluginData("diagramNodeId"),
        diagramData: firstSelectedNode.getPluginData("diagramData"),
        diagramId: firstSelectedNode.getPluginData("diagramId"),
      });
    } else {
      emit<SetSelectedNodeData>("SET_SELECTED_NODE_DATA", {
        diagramNodeId: "",
        diagramData: "",
        diagramId: "",
      });
    }
  });

  on("REQUEST_FONT_SIZE", (id) => {
    loadSettingsAsync("globalFontSizes").then((globalFontSizes) => {
      emit("RECEIVE_FONT_SIZE", globalFontSizes[id]);
    });
  });

  on("FONT_SIZE_CHANGED", async ({ id, newFontSize }) => {
    const globalFontSizes =
      (await figma.clientStorage.getAsync("globalFontSizes")) || {};
    globalFontSizes[id] = newFontSize;
    await figma.clientStorage.setAsync("globalFontSizes", globalFontSizes);
  });

  on<SavePersistedState>(
    "SAVE_PERSISTED_STATE",
    async function (settings: PersistedState) {
      try {
        await saveSettingsAsync({ ...settings }, SETTINGS_KEY);
      } catch (error: any) {
        emit<HandleError>("HANDLE_ERROR", error.message);
      }
    }
  );

  once<SetUILoaded>("SET_UI_LOADED", async function () {
    const persistedState = await loadSettingsAsync(
      defaultSettings,
      SETTINGS_KEY
    );

    emit<GetPersistedState>("GET_PERSISTED_STATE", {
      ...persistedState,
    });
  });

  on<DrawDiagram>("DRAW_DIAGRAM", async function (params) {
    const { diagramId, stream } = params;
    // Only clear existing nodes once at the beginning of a streaming session
    if (stream && !clearedDiagramIds.has(diagramId)) {
      clearedDiagramIds.add(diagramId);
      await drawDiagram({ ...params, stream: true });
      return;
    }
    // Subsequent streaming chunks skip the deleteExistingDiagram pass
    await drawDiagram({ ...params, stream: false });
  });

  on<EndDraw>("END_DRAW", (diagramId) => {
    clearedDiagramIds.delete(diagramId);
  });

  showUI(
    {
      height: UI_HEIGHT,
      width: UI_WIDTH,
    },
    { defaultSettings }
  );
}
