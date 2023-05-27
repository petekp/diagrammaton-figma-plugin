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

const SETTINGS_KEY = "cluster-plugin";

const defaultSettings = {
  apiKey: "",
  iv: "",
  threshold: 0.16,
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
    const settings = await loadSettingsAsync(defaultSettings, SETTINGS_KEY);
    emit<GetSettings>("GET_SETTINGS", settings);
  });

  on<ExecutePlugin>("EXECUTE_PLUGIN", async function ({ input }) {
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
