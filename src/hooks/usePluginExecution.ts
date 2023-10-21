import { useCallback, useRef } from "preact/hooks";
import { emit } from "@create-figma-plugin/utilities";

import debug from "../debug";
import { generateTimeBasedUUID } from "../util";
import { DrawDiagram, DiagramElement } from "../types";
import { pluginContext } from "../components/PluginContext";
import { createDiagramLayout } from "../createDiagramClient";
import { StreamElement, fetchStream } from "../fetchDiagramData";

export function usePluginExecution() {
  const {
    state: {
      licenseKey,
      model,
      orientation,
      error,
      selectedDiagramData,
      selectedDiagramId,
      selectedDiagramNodeId,
    },
    dispatch,
    clearErrors,
  } = pluginContext();

  let errorMessage = error;

  const diagramId = useRef(generateTimeBasedUUID());
  const diagramNodes = useRef<DiagramElement[]>([]);
  const abortControllerRef = useRef(new AbortController());
  const isDiagramSelected = !!selectedDiagramNodeId;

  const handleStreamElement = (element: StreamElement) => {
    switch (element.type) {
      case "end":
        break;
      case "message":
        errorMessage += element.data;
        dispatch({
          type: "SET_ERROR",
          payload: errorMessage,
        });
        break;
      case "error":
        dispatch({
          type: "SET_ERROR",
          payload: element.data,
        });
        dispatch({
          type: "SET_IS_LOADING",
          payload: false,
        });
        break;
      case "node":
        if (debug.enabled) console.log(element.data);
        if (element.data) {
          diagramNodes.current = diagramNodes.current.concat(element.data);
        }
        if (diagramNodes.current) {
          handleDrawDiagram({
            diagramNodes: diagramNodes.current,
            diagramId: diagramId.current,
          });
        } else {
          throw new Error("Error drawing diagram.");
        }
        break;
    }
  };

  const handleError = (err: unknown) => {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        console.log("Stream aborted.");
      } else {
        console.error({ err });
      }
    }
  };

  const handleStreamDiagram = useCallback(
    async (input: string) => {
      if (!input) {
        return dispatch({
          type: "SET_ERROR",
          payload: "Please enter a description.",
        });
      }

      diagramId.current = generateTimeBasedUUID();
      abortControllerRef.current = new AbortController();
      errorMessage = "";
      clearErrors();
      dispatch({ type: "SET_IS_LOADING", payload: true });

      const payload = isDiagramSelected
        ? {
            action: "modify",
            data: {
              diagramId: selectedDiagramId,
              diagramNodeId: selectedDiagramNodeId,
              diagramData: selectedDiagramData,
              instructions: input,
              licenseKey,
              model,
            },
          }
        : {
            action: "generate",
            data: {
              diagramId: diagramId.current,
              diagramDescription: input,
              licenseKey,
              model,
            },
          };

      console.log({ payload });

      try {
        for await (const element of fetchStream({
          ...payload,
          signal: abortControllerRef.current.signal,
        })) {
          handleStreamElement(element);
        }
      } catch (err) {
        handleError(err);
      } finally {
        diagramNodes.current = [];
        dispatch({ type: "SET_IS_LOADING", payload: false });
      }
    },
    [
      licenseKey,
      error,
      selectedDiagramData,
      selectedDiagramId,
      selectedDiagramNodeId,
    ]
  );

  async function handleDrawDiagram({
    diagramNodes,
    diagramId,
  }: {
    diagramNodes: DiagramElement[];
    diagramId: string;
  }) {
    if (debug.enabled) console.log(diagramId);
    const positionsObject = await createDiagramLayout({
      parsedOutput: diagramNodes,
      orientation,
    });

    emit<DrawDiagram>("DRAW_DIAGRAM", {
      diagram: diagramNodes,
      diagramId,
      stream: true,
      positionsObject,
    });
  }

  function handleCancel() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    dispatch({
      type: "SET_IS_LOADING",
      payload: false,
    });
  }

  return { handleStreamDiagram, handleCancel };
}
