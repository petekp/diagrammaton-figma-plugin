import { h } from "preact";
import { pluginContext } from "./PluginContext";
import { useCallback, useEffect, useRef } from "preact/hooks";
import {
  Button,
  Container,
  IconWarning32,
  IconCross32,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";

import { fetchDiagramData } from "../fetchDiagramData";
import { AutoSizeTextInput } from "./AutoSizeTextInput";
import { ExecutePlugin, DiagramElement } from "../types";
import { createDiagram } from "../createDiagramClient";
import styles from "./styles.css";

export function NaturalInputView() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const {
    error,
    setError,
    setShowRequired,
    isLoading,
    setIsLoading,
    licenseKey,
    orientation,
    naturalInput,
    setNaturalInput,
    diagramSyntax,
    model,
  } = pluginContext();

  const handleGetCompletions = useCallback(async () => {
    if (!naturalInput) {
      setError("Please enter a diagram description");
      return;
    }
    if (!licenseKey) {
      setShowRequired(true);
      setError("Please enter a license key in Settings");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      const { type, data } = await fetchDiagramData({
        licenseKey,
        model,
        input: naturalInput,
      });

      console.log("Response: ", { type, data });

      if (type === "message" || type === "error") {
        setError(data);
        return;
      }

      await handleExecutePlugin(data);
    } catch (err) {
      console.log({ err });
      // @ts-ignore-next
      setError(err.message || err || "There was an error");
    } finally {
      setIsLoading(false);
    }
  }, [naturalInput, licenseKey]);

  const handleExecutePlugin = useCallback(
    async function (input: DiagramElement[]) {
      const positionsObject = await createDiagram({
        parsedOutput: input,
        orientation,
      });

      emit<ExecutePlugin>("EXECUTE_PLUGIN", {
        diagram: input,
        positionsObject,
        syntax: diagramSyntax,
      });
    },
    [naturalInput]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && event.shiftKey) {
        handleGetCompletions();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleGetCompletions]);

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
          placeholder="Describe your diagram"
          grow={false}
          spellCheck={false}
          variant="border"
          value={naturalInput}
          onValueInput={(val: string) => {
            setNaturalInput(val);
          }}
          onFocusCapture={() => {
            setError("");
          }}
        />

        {error && (
          <div className={styles.warningBanner}>
            <IconWarning32 />
            <div className={styles.warningText}>{error}</div>
            <IconCross32 onClick={() => setError("")} />
          </div>
        )}
        <Button loading={isLoading} fullWidth onClick={handleGetCompletions}>
          Generate &nbsp; (⇧ + ⏎)
        </Button>
      </div>
      <VerticalSpace space="small" />
    </Container>
  );
}
