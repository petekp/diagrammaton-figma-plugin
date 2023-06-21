import { h, createContext, ComponentChildren } from "preact";
import { useCallback, useContext, useEffect, useState } from "preact/hooks";
import { emit, on, once } from "@create-figma-plugin/utilities";

import {
  GetPersistedState,
  HandleError,
  SavePersistedState,
  SetLoading,
  SetSelectedNodesCount,
  PersistedState,
} from "../types";
import { GPTModels } from "../gpt";

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
  model: keyof typeof GPTModels;
  setModel: (model: keyof typeof GPTModels) => void;
  orientation: string;
  setOrientation: (orientation: string) => void;

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
  defaultSettings: PersistedState;
  children?: ComponentChildren;
}) => {
  const [numNodesSelected, setNumNodesSelected] = useState<number>(0);
  const [showRequired, setShowRequired] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [diagramSyntax, setDiagramSyntax] = useState<string>(
    defaultSettings.syntaxInput
  );
  const [naturalInput, setNaturalInput] = useState<string>(
    defaultSettings.naturalInput
  );
  const [apiKey, setAPIKey] = useState<string>(defaultSettings.apiKey);
  const [customPrompt, setCustomPrompt] = useState<string>(
    defaultSettings.customPrompt
  );
  const [model, setModel] = useState<keyof typeof GPTModels>(
    defaultSettings.model
  );
  const [orientation, setOrientation] = useState<string>(
    defaultSettings.orientation
  );
  const [settingsLoaded, setPersistedStateLoaded] = useState<boolean>(false);

  const { isFigJam } = defaultSettings;

  const clearErrors = () => {
    setError("");
    setShowRequired(false);
  };

  useEffect(() => {
    console.log("context rendered");
    if (settingsLoaded) {
      emit<SavePersistedState>("SAVE_PERSISTED_STATE", {
        ...defaultSettings,
        apiKey,
        model,
        customPrompt,
        naturalInput,
        syntaxInput: diagramSyntax,
        orientation,
      });
    }
  }, [
    apiKey,
    model,
    customPrompt,
    defaultSettings,
    settingsLoaded,
    naturalInput,
    diagramSyntax,
    orientation,
  ]);

  const handleError = useCallback(
    function (error: string) {
      setError(error);
      setIsLoading(false);
    },
    [error]
  );

  once<GetPersistedState>("GET_PERSISTED_STATE", (state: PersistedState) => {
    setAPIKey(state.apiKey);
    setModel(state.model);
    setCustomPrompt(state.customPrompt);
    setPersistedStateLoaded(true);
    setNaturalInput(state.naturalInput);
    setDiagramSyntax(state.syntaxInput);
    setOrientation(state.orientation);
  });

  on<HandleError>("HANDLE_ERROR", handleError);
  on<SetLoading>("SET_LOADING", setIsLoading);
  on<SetSelectedNodesCount>("SET_SELECTED_NODES_COUNT", setNumNodesSelected);

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
        orientation,
        setOrientation,
        clearErrors,
      }}
    >
      {children}
    </PluginContext.Provider>
  );
};
