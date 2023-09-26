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
  ExecutePlugin,
  GetPersistedState,
  HandleError,
  SetLoading,
  SetSelectedNodesCount,
  SetUILoaded,
  PersistedState,
  SavePersistedState,
} from "./types";

import debug from "./debug";

import { drawDiagram } from "./createDiagramServer";

const SETTINGS_KEY = "cohere-plugin";

const defaultSettings: PersistedState = {
  isFigJam: figma.editorType === "figjam",
  licenseKey: "",
  customPrompt: "",
  model: "gpt3",
  feedback: "",
  isNewUser: true,
  isSignInVisible: false,
  naturalInput: "",
  syntaxInput: "",
  orientation: "LR",
};

export default function () {
  figma.on("selectionchange", () => {
    emit<SetSelectedNodesCount>(
      "SET_SELECTED_NODES_COUNT",
      figma.currentPage.selection.length
    );

    console.log(figma.currentPage.selection);

    const firstSelectedNode = figma.currentPage.selection[0];

    if (firstSelectedNode) {
      console.log(firstSelectedNode.getPluginData("syntax"));
      console.log(firstSelectedNode.getPluginData("diagramId"));
    }

    figma.currentPage.selection.forEach((node) => {
      console.log(node.id);
    });
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

  on<ExecutePlugin>(
    "EXECUTE_PLUGIN",
    async function ({ diagram, positionsObject, syntax }) {
      await drawDiagram({ diagram, positionsObject, pluginData: syntax });

      try {
        emit<SetLoading>("SET_LOADING", true);
      } catch (error: any) {
        emit<HandleError>("HANDLE_ERROR", error.message);
      } finally {
        emit<SetLoading>("SET_LOADING", false);
      }
    }
  );

  showUI(
    {
      height: UI_HEIGHT,
      width: UI_WIDTH,
    },
    { defaultSettings }
  );
}
