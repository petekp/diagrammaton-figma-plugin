import { UI_HEIGHT, UI_WIDTH } from "./constants";
import {
  emit,
  once,
  on,
  showUI,
  loadSettingsAsync,
  saveSettingsAsync,
} from "@create-figma-plugin/utilities";

import * as CryptoJS from "crypto-js";

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

import { drawDiagram } from "./createDiagramServer";
import { generateRandomHex } from "./util";

const SETTINGS_KEY = "cohere-plugin";

const ek = "daca82e5ac526e90e91ee3f5c11de204927c4cc4e6192544dc5ecbfbb514826b";
const encryptionKeyWordArray = CryptoJS.enc.Hex.parse(ek);

const defaultSettings: PersistedState = {
  isFigJam: figma.editorType === "figjam",
  apiKey: "",
  iv: "",
  customPrompt: "",
  model: "gpt3",
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
      let encryptedData;

      const { apiKey } = settings;

      if (apiKey === "") {
        encryptedData = {
          apiKey: "",
          iv: "",
        };
      } else {
        const iv = CryptoJS.enc.Hex.parse(generateRandomHex((128 / 8) * 2));
        const encryptedApiKey = CryptoJS.AES.encrypt(
          apiKey,
          encryptionKeyWordArray,
          {
            iv: iv,
          }
        );
        encryptedData = {
          apiKey: encryptedApiKey.ciphertext.toString(CryptoJS.enc.Hex),
          iv: iv.toString(CryptoJS.enc.Hex),
        };
      }

      try {
        await saveSettingsAsync(
          { ...settings, ...encryptedData },
          SETTINGS_KEY
        );
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

    if (persistedState.apiKey && persistedState.iv) {
      const iv = CryptoJS.enc.Hex.parse(persistedState.iv);
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(persistedState.apiKey),
      });
      const decryptedApiKeyBytes = CryptoJS.AES.decrypt(
        cipherParams,
        encryptionKeyWordArray,
        { iv: iv }
      );
      const decryptedApiKey = CryptoJS.enc.Utf8.stringify(decryptedApiKeyBytes);

      emit<GetPersistedState>("GET_PERSISTED_STATE", {
        ...persistedState,
        apiKey: decryptedApiKey,
      });
    } else {
      emit<GetPersistedState>("GET_PERSISTED_STATE", persistedState);
    }
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
