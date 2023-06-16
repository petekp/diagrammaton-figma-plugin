import { h, createContext, ComponentChildren } from "preact";
import { useCallback, useContext, useEffect, useState } from "preact/hooks";
import {
  GetSettings,
  HandleError,
  SaveSettings,
  SetLoading,
  SetSelectedNodes,
  Settings,
} from "../types";
import { emit, on } from "@create-figma-plugin/utilities";

export type StateContextType = {
  isFigJam: boolean;
  numNodesSelected: number;
  setNumNodesSelected: (num: number) => void;
  error: string;
  setError: (err: string) => void;
  showRequired: boolean;
  setShowRequired: (showRequired: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  diagramSyntax: string;
  setDiagramSyntax: (syntax: string) => void;
  naturalInput: string;
  setNaturalInput: (input: string) => void;
  apiKey: string;
  setAPIKey: (key: string) => void;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
  model: string;
  setModel: (model: string) => void;
  clearErrors: () => void;
};

const PluginContext = createContext<StateContextType | undefined>(undefined);

export const pluginContext = () => {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error(
      "pluginContext must be used within an PluginContextProvider"
    );
  }
  return context;
};

export const PluginContextProvider = ({
  defaultSettings,
  children,
}: {
  defaultSettings: Settings;
  children?: ComponentChildren;
}) => {
  const [numNodesSelected, setNumNodesSelected] = useState<number>(0);
  const [showRequired, setShowRequired] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [diagramSyntax, setDiagramSyntax] = useState<string>("");
  const [naturalInput, setNaturalInput] = useState<string>("");
  const [apiKey, setAPIKey] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>(
    defaultSettings.customPrompt
  );
  const [model, setModel] = useState<string>(defaultSettings.model);
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false);

  const clearErrors = () => {
    setError("");
    setShowRequired(false);
  };

  const { isFigJam } = defaultSettings;

  useEffect(() => {
    if (settingsLoaded) {
      emit<SaveSettings>("SAVE_SETTINGS", {
        ...defaultSettings,
        apiKey,
        model,
        customPrompt,
      });
    }
  }, [apiKey, model, customPrompt, defaultSettings, settingsLoaded]);

  const handleError = useCallback(
    function (error: string) {
      setError(error);
      setIsLoading(false);
    },
    [error]
  );

  on<GetSettings>("GET_SETTINGS", (settings: Settings) => {
    console.log("Context got settings: ", settings);
    setAPIKey(settings.apiKey);
    setModel(settings.model);
    setCustomPrompt(settings.customPrompt);
    setSettingsLoaded(true);
  });

  on<HandleError>("HANDLE_ERROR", handleError);
  on<SetLoading>("SET_LOADING", setIsLoading);
  on<SetSelectedNodes>("SET_SELECTED_NODES", setNumNodesSelected);

  return (
    <PluginContext.Provider
      value={{
        isFigJam,
        numNodesSelected,
        setNumNodesSelected,
        error,
        setError,
        showRequired,
        setShowRequired,
        isLoading,
        setIsLoading,
        diagramSyntax,
        setDiagramSyntax,
        naturalInput,
        setNaturalInput,
        apiKey,
        setAPIKey,
        customPrompt,
        setCustomPrompt,
        model,
        setModel,
        clearErrors,
      }}
    >
      {children}
    </PluginContext.Provider>
  );
};
