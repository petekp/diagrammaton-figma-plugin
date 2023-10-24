import { h } from "preact";
import {
  Button,
  Container,
  VerticalSpace,
  Columns,
} from "@create-figma-plugin/ui";
import { motion } from "framer-motion";
import { useEffect } from "preact/hooks";

import styles from "./styles.css";
import { pluginContext } from "./PluginContext";
import { AutoSizeTextInput } from "./AutoSizeTextInput";
import { usePluginExecution } from "../hooks/usePluginExecution";

export function ModifyView() {
  const {
    state: { isLoading, modifyInput },
    dispatch,
    clearErrors,
  } = pluginContext();

  const { handleStreamDiagram, handleCancel } = usePluginExecution();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === "Enter" && event.ctrlKey) ||
        (event.key === "Enter" && event.metaKey)
      ) {
        handleStreamDiagram(modifyInput);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleStreamDiagram, modifyInput]);

  const isWindows = navigator.userAgent.indexOf("Win") != -1;

  const fullHeightColumnStyles = {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  };

  return (
    <motion.div style={fullHeightColumnStyles}>
      <Container space="small" style={fullHeightColumnStyles}>
        <VerticalSpace space="small" />
        <motion.div style={{ ...fullHeightColumnStyles, position: "relative" }}>
          <AutoSizeTextInput
            id="modify"
            autoFocus={false}
            disabled={isLoading}
            placeholder="Modify this diagram..."
            grow={false}
            spellCheck={false}
            variant="border"
            value={`${modifyInput}`}
            onValueInput={(val: string) => {
              dispatch({ type: "SET_MODIFY_INPUT", payload: val });
            }}
            onFocusCapture={clearErrors}
            style={{ padding: "24px 16px" }}
          />

          <VerticalSpace space="extraSmall" />

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
              onClick={() => handleStreamDiagram(modifyInput)}
            >
              Modify {isWindows ? "Ctrl" : "⌘"} + ⏎
            </Button>
          </Columns>
        </motion.div>
        <VerticalSpace space="small" />
      </Container>
    </motion.div>
  );
}
