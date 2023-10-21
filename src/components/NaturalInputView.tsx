import { h } from "preact";
import {
  Button,
  Container,
  VerticalSpace,
  Columns,
} from "@create-figma-plugin/ui";
import { useEffect } from "preact/hooks";
import { motion, AnimatePresence } from "framer-motion";

import styles from "./styles.css";
import { pluginContext } from "./PluginContext";
import { AutoSizeTextInput } from "./AutoSizeTextInput";
import Suggestions, { suggestionVariants } from "./Suggestions";
import { usePluginExecution } from "../hooks/usePluginExecution";
import { tabTransition } from "../animations";

export function NaturalInputView() {
  const {
    state: { naturalInput, isLoading, showSuggestions, selectedDiagramNodeId },
    dispatch,
    clearErrors,
  } = pluginContext();

  const isDiagramSelected = !!selectedDiagramNodeId;

  const { handleStreamDiagram, handleCancel } = usePluginExecution();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === "Enter" && event.ctrlKey) ||
        (event.key === "Enter" && event.metaKey)
      ) {
        handleStreamDiagram(naturalInput);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleStreamDiagram, naturalInput]);

  const isWindows = navigator.userAgent.indexOf("Win") != -1;

  return (
    <motion.div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Container
        space="small"
        style={{ display: "flex", flexDirection: "column", flex: 1 }}
      >
        <VerticalSpace space="small" />
        <motion.div
          style={{ display: "flex", flexDirection: "column", flex: 1 }}
        >
          <AutoSizeTextInput
            autoFocus={true}
            disabled={isLoading}
            style={{
              lineHeight: 1.3,
              flex: 1,
            }}
            placeholder={
              isDiagramSelected
                ? "Modify this diagram by..."
                : "Generate a diagram of..."
            }
            grow={false}
            spellCheck={false}
            variant="border"
            value={naturalInput}
            onValueInput={(val: string) => {
              dispatch({ type: "SET_NATURAL_INPUT", payload: val });
            }}
            onFocusCapture={clearErrors}
          />
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                id="suggestions"
                layout
                variants={suggestionVariants}
                initial="visible"
                animate="visible"
                exit="exit"
              >
                <VerticalSpace space="small" />
                <Suggestions onClick={handleStreamDiagram} />
              </motion.div>
            )}
          </AnimatePresence>

          <VerticalSpace space="small" />

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
              onClick={() => handleStreamDiagram(naturalInput)}
            >
              Generate {isWindows ? "Ctrl" : "⌘"} + ⏎
            </Button>
          </Columns>
        </motion.div>
        <VerticalSpace space="small" />
      </Container>
    </motion.div>
  );
}
