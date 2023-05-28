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

import { createDiagram } from "./createDiagram";

const SETTINGS_KEY = "mermaid-plugin";

const defaultSettings = {
  isFigJam: figma.editorType === "figjam",
};

export default function () {
  figma.on("selectionchange", () => {
    emit<SetSelectedNodes>(
      "SET_SELECTED_NODES",
      figma.currentPage.selection.length
    );
  });

  once<SetUILoaded>("SET_UI_LOADED", async function () {
    await figma.loadFontAsync({ family: "Inter", style: "Medium" })
    const settings = await loadSettingsAsync(defaultSettings, SETTINGS_KEY);
    emit<GetSettings>("GET_SETTINGS", settings);
  });

  on<ExecutePlugin>("EXECUTE_PLUGIN", async function ({ input }) {
    console.log({input})
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
