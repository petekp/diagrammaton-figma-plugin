import { h, createContext, ComponentChildren } from "preact";
import { useContext, useState } from "preact/hooks";
import { Settings } from "../types";

export type StateContextType = {
  numNodesSelected: number;
  setNumNodesSelected: (num: number) => void;
  error: string;
  setError: (err: string) => void;
  showRequired: boolean;
  setShowRequired: (showRequired: boolean) => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  isFigJam: boolean;
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
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [showRequired, setShowRequired] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const { isFigJam } = settings;

  return (
    <PluginContext.Provider
      value={{
        numNodesSelected,
        setNumNodesSelected,
        error,
        setError,
        showRequired,
        setShowRequired,
        settings,
        setSettings,
        isLoading,
        setIsLoading,
        isFigJam,
      }}
    >
      {children}
    </PluginContext.Provider>
  );
};
