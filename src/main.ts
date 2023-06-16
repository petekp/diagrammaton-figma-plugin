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
  GetSettings,
  HandleError,
  SetLoading,
  SetSelectedNodes,
  SetUILoaded,
  Settings,
  SaveSettings,
} from "./types";

import { drawDiagram } from "./createDiagramServer";
import { generateRandomHex } from "./util";

const SETTINGS_KEY = "cohere-plugin";

const ek = "daca82e5ac526e90e91ee3f5c11de204927c4cc4e6192544dc5ecbfbb514826b";
const encryptionKeyWordArray = CryptoJS.enc.Hex.parse(ek);

const defaultSettings = {
  isFigJam: figma.editorType === "figjam",
  apiKey: "",
  iv: "",
  customPrompt: "",
  model: "GPT 3.5",
};

export default function () {
  figma.on("selectionchange", () => {
    emit<SetSelectedNodes>(
      "SET_SELECTED_NODES",
      figma.currentPage.selection.length
    );
  });

  on<SaveSettings>("SAVE_SETTINGS", async function (settings: Settings) {
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
      await saveSettingsAsync({ ...settings, ...encryptedData }, SETTINGS_KEY);

      console.log("SAVE_SETTINGS: ", { ...settings, ...encryptedData });
    } catch (error: any) {
      emit<HandleError>("HANDLE_ERROR", error.message);
    }
  });

  once<SetUILoaded>("SET_UI_LOADED", async function () {
    const settings = await loadSettingsAsync(defaultSettings, SETTINGS_KEY);

    if (settings.apiKey && settings.iv) {
      const iv = CryptoJS.enc.Hex.parse(settings.iv);
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(settings.apiKey),
      });
      const decryptedApiKeyBytes = CryptoJS.AES.decrypt(
        cipherParams,
        encryptionKeyWordArray,
        { iv: iv }
      );
      const decryptedApiKey = CryptoJS.enc.Utf8.stringify(decryptedApiKeyBytes);

      emit<GetSettings>("GET_SETTINGS", {
        ...settings,
        apiKey: decryptedApiKey,
      });
    } else {
      console.log("SET_UI_LOADED emit get settings: ", settings);
      emit<GetSettings>("GET_SETTINGS", settings);
    }
  });

  on<ExecutePlugin>(
    "EXECUTE_PLUGIN",
    async function ({ diagram, positionsObject }) {
      await drawDiagram({ diagram, positionsObject });

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
