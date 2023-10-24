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
} from "./types";

import { drawDiagram } from "./createDiagramServer";

const SETTINGS_KEY = "figjam-diagrammaton-plugin";

export const defaultSettings: PersistedState = {
  customPrompt: "",
  feedback: "",
  isFigJam: figma.editorType === "figjam",
  isNewUser: true,
  isSignInVisible: false,
  licenseKey: "",
  model: "gpt3",
  naturalInput: "",
  orientation: "LR",
  showSuggestions: true,
  modifyInput: "",
  textareaFontSizeById: {},
};

export default function () {
  figma.on("selectionchange", () => {
    // emit<SetSelectedNodesCount>(
    //   "SET_SELECTED_NODES_COUNT",
    //   figma.currentPage.selection.length
    // );

    const firstSelectedNode = figma.currentPage.selection[0];

    if (firstSelectedNode) {
      emit<SetSelectedNodeData>("SET_SELECTED_NODE_DATA", {
        diagramNodeId:
          figma.currentPage.selection[0].getPluginData("diagramNodeId"),
        diagramData:
          figma.currentPage.selection[0].getPluginData("diagramData"),
        diagramId: figma.currentPage.selection[0].getPluginData("diagramId"),
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
    await drawDiagram(params);
  });

  showUI(
    {
      height: UI_HEIGHT,
      width: UI_WIDTH,
    },
    { defaultSettings }
  );
}
