import { h } from "preact";
import { pluginContext } from "./PluginContext";
import { useCallback, useEffect, useRef } from "preact/hooks";
import {
  Button,
  Container,
  IconWarning32,
  IconCross32,
  VerticalSpace,
  Columns,
} from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";

import { fetchStream } from "../fetchDiagramData";
import { AutoSizeTextInput } from "./AutoSizeTextInput";
import { ExecutePlugin, DiagramElement } from "../types";
import { createDiagram } from "../createDiagramClient";
import styles from "./styles.css";
import { generateTimeBasedUUID } from "../util";

export function NaturalInputView() {
  const {
    state: { naturalInput, licenseKey, model, orientation, error, isLoading },
    dispatch,
  } = pluginContext();

  let errorMessage = error;
  const diagramId = useRef(generateTimeBasedUUID());
  const diagramElements = useRef<DiagramElement[]>([]);

  const abortControllerRef = useRef(new AbortController());

  const handleStreamElement = (element) => {
    if (element === null) {
      console.log("set loading false");
      dispatch({
        type: "SET_IS_LOADING",
        payload: false,
      });

      return;
    }

    if (
      typeof element === "object" &&
      "type" in element &&
      element.type === "error"
    ) {
      console.log("error", element.message);
      dispatch({
        type: "SET_ERROR",
        payload: element.message,
      });
      dispatch({
        type: "SET_IS_LOADING",
        payload: false,
      });
      return;
    }

    if (typeof element === "string") {
      errorMessage += element;
      console.log(errorMessage);
      dispatch({
        type: "SET_ERROR",
        payload: errorMessage,
      });

      return;
    }

    if (typeof element === "object") {
      diagramElements.current.push(element as DiagramElement);

      handleExecutePlugin({
        diagramElements: diagramElements.current,
        diagramId: diagramId.current,
      });
    }
  };
  const handleError = (err: unknown) => {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        console.error({ err });
      }
    }
  };

  const handleGetCompletionsStream = useCallback(async () => {
    diagramId.current = generateTimeBasedUUID();
    abortControllerRef.current = new AbortController();
    errorMessage = "";
    dispatch({ type: "SET_ERROR", payload: "" });
    dispatch({ type: "SET_IS_LOADING", payload: true });

    try {
      for await (const element of fetchStream({
        diagramDescription: naturalInput,
        licenseKey,
        model,
        signal: abortControllerRef.current.signal,
      })) {
        handleStreamElement(element);
      }
    } catch (err) {
      handleError(err);
    } finally {
      diagramElements.current = [];
    }
  }, [naturalInput, licenseKey, error]);

  const handleExecutePlugin = useCallback(
    async function ({
      diagramElements,
      diagramId,
    }: {
      diagramElements: DiagramElement[];
      diagramId: string;
    }) {
      console.log(diagramId);
      const positionsObject = await createDiagram({
        parsedOutput: diagramElements,
        orientation,
      });

      emit<ExecutePlugin>("EXECUTE_PLUGIN", {
        diagram: diagramElements,
        diagramId,
        stream: true,
        positionsObject,
      });
    },
    [naturalInput]
  );

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    dispatch({
      type: "SET_IS_LOADING",
      payload: false,
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === "Enter" && event.ctrlKey) ||
        (event.key === "Enter" && event.metaKey)
      ) {
        handleGetCompletionsStream();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleGetCompletionsStream]);

  const isWindows = navigator.userAgent.indexOf("Win") != -1;

  return (
    <Container
      space="small"
      style={{ display: "flex", flexDirection: "column", flex: 1 }}
    >
      <VerticalSpace space="small" />
      <div
        style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}
      >
        <AutoSizeTextInput
          disabled={isLoading}
          style={{
            lineHeight: 1.3,
            flex: 1,
          }}
          placeholder="Generate a diagram of..."
          grow={false}
          spellCheck={false}
          variant="border"
          value={naturalInput}
          onValueInput={(val: string) => {
            dispatch({ type: "SET_NATURAL_INPUT", payload: val });
          }}
          onFocusCapture={() => {
            dispatch({ type: "SET_ERROR", payload: "" });
          }}
        />

        {error && (
          <div className={styles.warningBanner}>
            <IconWarning32 />
            <div className={styles.warningText}>{error}</div>
            <IconCross32
              onClick={() => dispatch({ type: "SET_ERROR", payload: "" })}
            />
          </div>
        )}
        <Columns space="extraSmall">
          {isLoading ? (
            <Button
              fullWidth
              secondary
              className={styles.fullWidth}
              onClick={handleCancel}
            >
              Stop
            </Button>
          ) : null}

          <Button
            loading={isLoading}
            fullWidth
            disabled={isLoading}
            className={styles.fullWidth}
            onClick={handleGetCompletionsStream}
          >
            Generate &nbsp; {isWindows ? "Ctrl" : "⌘"} + ⏎
          </Button>
        </Columns>
      </div>
      <VerticalSpace space="small" />
    </Container>
  );
}
