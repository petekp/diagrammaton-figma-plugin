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
  CreateTab,
  PrimaryTab,
} from "../types";
import { GPTModels } from "../fetchDiagramData";

export type StateContextType = {
  isFigJam: boolean;
  isNewUser: boolean;
  setIsNewUser: (isNewUser: boolean) => void;
  isPersistedStateLoading: boolean;
  setIsPersistedStateLoading: (isLoading: boolean) => void;
  debug: boolean;
  setDebug: (enabled: boolean) => void;
  numNodesSelected: number;
  setNumNodesSelected: (num: number) => void;
  error: string;
  setError: (err: string) => void;
  feedback: string;
  setFeedback: (feedback: string) => void;
  showRequired: boolean;
  setShowRequired: (showRequired: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  diagramSyntax: string;
  setDiagramSyntax: (syntax: string) => void;
  naturalInput: string;
  setNaturalInput: (input: string) => void;
  licenseKey: string;
  setLicenseKey: (key: string) => void;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
  model: GPTModels;
  setModel: (model: GPTModels) => void;
  orientation: string;
  setOrientation: (orientation: string) => void;
  currentPrimaryTab: PrimaryTab;
  setCurrentPrimaryTab: (tab: PrimaryTab) => void;
  currentCreateTab: CreateTab;
  setCurrentCreateTab: (tab: CreateTab) => void;

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
  const [debug, setDebug] = useState<boolean>(false);
  const [isNewUser, setIsNewUser] = useState<boolean>(
    defaultSettings.isNewUser
  );
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
  const [feedback, setFeedback] = useState<string>(defaultSettings.feedback);
  const [licenseKey, setLicenseKey] = useState<string>(
    defaultSettings.licenseKey
  );
  const [customPrompt, setCustomPrompt] = useState<string>(
    defaultSettings.customPrompt
  );
  const [model, setModel] = useState<GPTModels>(defaultSettings.model);
  const [orientation, setOrientation] = useState<string>(
    defaultSettings.orientation
  );
  const [isPersistedStateLoading, setIsPersistedStateLoading] =
    useState<boolean>(true);

  const [currentPrimaryTab, setCurrentPrimaryTab] = useState<PrimaryTab>(
    defaultSettings.currentPrimaryTab
  );
  const [currentCreateTab, setCurrentCreateTab] =
    useState<CreateTab>("Natural");

  const { isFigJam } = defaultSettings;

  const clearErrors = () => {
    setError("");
    setShowRequired(false);
  };

  useEffect(() => {
    if (!isPersistedStateLoading) {
      emit<SavePersistedState>("SAVE_PERSISTED_STATE", {
        ...defaultSettings,
        licenseKey,
        model,
        customPrompt,
        isNewUser,
        naturalInput,
        currentPrimaryTab,
        feedback,
        syntaxInput: diagramSyntax,
        orientation,
      });
    }
  }, [
    licenseKey,
    model,
    customPrompt,
    defaultSettings,
    isPersistedStateLoading,
    isNewUser,
    currentPrimaryTab,
    feedback,
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
    setLicenseKey(state.licenseKey);
    setModel(state.model);
    setCustomPrompt(state.customPrompt);
    setFeedback(state.feedback);
    setCurrentPrimaryTab(state.currentPrimaryTab);
    setIsNewUser(state.isNewUser);
    setNaturalInput(state.naturalInput);
    setDiagramSyntax(state.syntaxInput);
    setOrientation(state.orientation);

    setIsPersistedStateLoading(false);
  });

  on<HandleError>("HANDLE_ERROR", handleError);
  on<SetLoading>("SET_LOADING", setIsLoading);
  on<SetSelectedNodesCount>("SET_SELECTED_NODES_COUNT", setNumNodesSelected);

  return (
    <PluginContext.Provider
      value={{
        isFigJam,
        isNewUser,
        setIsNewUser,
        debug,
        setDebug,
        numNodesSelected,
        setNumNodesSelected,
        error,
        setError,
        showRequired,
        setShowRequired,
        isPersistedStateLoading,
        setIsPersistedStateLoading,
        isLoading,
        setIsLoading,
        diagramSyntax,
        setDiagramSyntax,
        naturalInput,
        setNaturalInput,
        licenseKey,
        setLicenseKey,
        customPrompt,
        setCustomPrompt,
        model,
        setModel,
        orientation,
        setOrientation,
        clearErrors,
        currentPrimaryTab,
        setCurrentPrimaryTab,
        currentCreateTab,
        setCurrentCreateTab,
        feedback,
        setFeedback,
      }}
    >
      {children}
    </PluginContext.Provider>
  );
};
