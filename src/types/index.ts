import { EventHandler } from "@create-figma-plugin/utilities";

import { DiagramElement, Position } from "./diagramming-types";
import { GPTModels } from "../gpt";
export * from "./diagramming-types";

export type PersistedState = {
  isFigJam: boolean;
  apiKey: string;
  iv: string;
  customPrompt: string;
  model: keyof typeof GPTModels;
  naturalInput: string;
  syntaxInput: string;
  orientation: string;
};

export type CreateTab = "Natural" | "Syntax";
export type PrimaryTab = "Create" | "Settings";

export interface GetPersistedState extends EventHandler {
  name: "GET_PERSISTED_STATE";
  handler: (state: PersistedState) => void;
}

export interface SavePersistedState extends EventHandler {
  name: "SAVE_PERSISTED_STATE";
  handler: (state: PersistedState) => void;
}

export interface ExecutePlugin extends EventHandler {
  name: "EXECUTE_PLUGIN";
  handler: ({
    diagram,
    positionsObject,
    syntax,
  }: {
    diagram: DiagramElement[];
    positionsObject: { [key: string]: Position };
    syntax: string;
  }) => void;
}

export interface HandleError extends EventHandler {
  name: "HANDLE_ERROR";
  handler: (error: string) => void;
}

export interface HandleKeySavedReceived extends EventHandler {
  name: "KEY_SAVED_RECEIVED";
  handler: (keySaved: boolean) => void;
}

export interface SetSelectedNodesCount extends EventHandler {
  name: "SET_SELECTED_NODES_COUNT";
  handler: (numNodesSelected: number) => void;
}

export interface SetLoading extends EventHandler {
  name: "SET_LOADING";
  handler: (isLoading: boolean) => void;
}

export interface SetUILoaded extends EventHandler {
  name: "SET_UI_LOADED";
  handler: () => void;
}
