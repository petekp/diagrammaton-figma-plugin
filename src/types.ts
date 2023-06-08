import { EventHandler } from "@create-figma-plugin/utilities";

export interface Node {
  id: string;
  label: string;
  shape: ShapeWithTextNode["shapeType"];
}

export interface NodeLink {
  label: string;
  condition?: string;
}

export interface DiagramElement {
  from: Node;
  link: NodeLink;
  to: Node;
}

export interface Position {
  x: number;
  y: number;
}

export * from "./diagramming-types";

export type Settings = {
  isFigJam: boolean;
};

export interface GetSettings extends EventHandler {
  name: "GET_SETTINGS";
  handler: (settings: Settings) => void;
}

export interface ExecutePlugin extends EventHandler {
  name: "EXECUTE_PLUGIN";
  handler: ({
    diagram,
    positionsObject,
  }: {
    diagram: DiagramElement[];
    positionsObject: { [key: string]: Position };
  }) => void;
}

export interface HandleError extends EventHandler {
  name: "HANDLE_ERROR";
  handler: (error: string) => void;
}

export interface SetSelectedNodes extends EventHandler {
  name: "SET_SELECTED_NODES";
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
