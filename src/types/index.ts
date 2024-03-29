import { EventHandler } from "@create-figma-plugin/utilities";

import { DiagramElement, Position } from "./diagramming-types";
import { GPTModels } from "../fetchDiagramData";
export * from "./diagramming-types";

export type PersistedState = {
  isFigJam: boolean;
  licenseKey: string;
  customPrompt: string;
  model: GPTModels;
  naturalInput: string;
  modifyInput: string;
  isNewUser: boolean;
  isSignInVisible: boolean;
  feedback: string;
  orientation: string;
  showSuggestions: boolean;
  textareaFontSizeById: Record<string, number>;
};

export type PrimaryTab = "Generate" | "Settings" | "Feedback";

export interface GetPersistedState extends EventHandler {
  name: "GET_PERSISTED_STATE";
  handler: (state: PersistedState) => void;
}

export interface SavePersistedState extends EventHandler {
  name: "SAVE_PERSISTED_STATE";
  handler: (state: PersistedState) => void;
}

export interface DrawDiagram extends EventHandler {
  name: "DRAW_DIAGRAM";
  handler: ({
    diagram,
    diagramId,
    stream,
    positionsObject,
  }: {
    diagram: DiagramElement[];
    diagramId: string;
    stream?: boolean;
    positionsObject: { [key: string]: Position };
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

export interface SetSelectedNodeData extends EventHandler {
  name: "SET_SELECTED_NODE_DATA";
  handler: ({
    diagramNodeId,
    diagramId,
    diagramData,
  }: {
    diagramNodeId: string;
    diagramId: string;
    diagramData: string;
  }) => void;
}

export interface SetLoading extends EventHandler {
  name: "SET_LOADING";
  handler: (isLoading: boolean) => void;
}

export interface SetUILoaded extends EventHandler {
  name: "SET_UI_LOADED";
  handler: () => void;
}

export type PluginState = PersistedState & {
  currentPrimaryTab: PrimaryTab;
  lastPrimaryTab: PrimaryTab;
  error: string;
  isLoading: boolean;
  isPersistedStateLoading: boolean;
  numNodesSelected: number;
  showRequired: boolean;
  showSuggestions: boolean;
  selectedDiagramId: string;
  selectedDiagramData: string;
  selectedDiagramNodeId: string;
  modifyInput: string;
  textareaFontSizeById: Record<string, number>;
};

export type Action =
  | {
      type: "SET_IS_NEW_USER";
      payload: boolean;
    }
  | {
      type: "SET_NUM_NODES_SELECTED";
      payload: number;
    }
  | {
      type: "SET_ERROR";
      payload: string;
    }
  | {
      type: "SET_IS_LOADING";
      payload: boolean;
    }
  | {
      type: "SET_DIAGRAM_SYNTAX";
      payload: string;
    }
  | {
      type: "SET_NATURAL_INPUT";
      payload: string;
    }
  | {
      type: "SET_MODIFY_INPUT";
      payload: string;
    }
  | {
      type: "SET_FEEDBACK";
      payload: string;
    }
  | {
      type: "SET_LICENSE_KEY";
      payload: string;
    }
  | {
      type: "SET_CUSTOM_PROMPT";
      payload: string;
    }
  | {
      type: "SET_MODEL";
      payload: GPTModels;
    }
  | {
      type: "SET_ORIENTATION";
      payload: string;
    }
  | {
      type: "SET_IS_PERSISTED_STATE_LOADING";
      payload: boolean;
    }
  | {
      type: "SET_SHOW_REQUIRED";
      payload: boolean;
    }
  | {
      type: "SET_CURRENT_PRIMARY_TAB";
      payload: PrimaryTab;
    }
  | {
      type: "SET_IS_FIGJAM";
      payload: boolean;
    }
  | {
      type: "SET_SHOW_SUGGESTIONS";
      payload: boolean;
    }
  | {
      type: "SET_SELECTED_DIAGRAM_ID";
      payload: string;
    }
  | {
      type: "SET_SELECTED_DIAGRAM_DATA";
      payload: string;
    }
  | {
      type: "SET_SELECTED_DIAGRAM_NODE_ID";
      payload: string;
    }
  | {
      type: "SET_TEXTAREA_FONT_SIZE_BY_ID";
      payload: Record<string, number>;
    };
