import { h } from "preact";
import { pluginContext } from "./PluginContext";
import {
  VerticalSpace,
  Container,
  IconWarning32,
  IconCross32,
  Button,
  Banner,
  IconCheckCircle32,
} from "@create-figma-plugin/ui";
import { motion } from "framer-motion";

import { AutoSizeTextInput } from "./AutoSizeTextInput";
import styles from "./styles.css";
import { useCallback, useState } from "preact/hooks";
import { sendFeedback } from "../sendFeedback";
import { tabTransition } from "../animations";

export function FeedbackView() {
  const [wasSuccessful, setWasSuccessful] = useState(false);

  const {
    state: {
      feedback,

      isLoading,
      error,

      licenseKey,
    },
    dispatch,
  } = pluginContext();

  const handleSendFeedback = useCallback(async () => {
    if (!feedback) {
      return;
    }

    if (!licenseKey) {
      dispatch({ type: "SET_SHOW_REQUIRED", payload: true });
      dispatch({
        type: "SET_ERROR",
        payload: "Please enter a license key in Settings",
      });
      return;
    }
    dispatch({
      type: "SET_ERROR",
      payload: "",
    });
    dispatch({
      type: "SET_IS_LOADING",
      payload: true,
    });
    setWasSuccessful(false);
    try {
      await sendFeedback({
        message: feedback,
        licenseKey,
      });
      setWasSuccessful(true);
      dispatch({
        type: "SET_FEEDBACK",
        payload: "",
      });
    } catch (err) {
      setWasSuccessful(false);
      if (err instanceof Error) {
        dispatch({
          type: "SET_ERROR",
          payload: err.message || "There was an error",
        });
      }
    } finally {
      dispatch({
        type: "SET_IS_LOADING",
        payload: false,
      });
    }
  }, [feedback]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1, x: 10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 1, x: -10 }}
      transition={tabTransition}
      style={{ flex: 1, flexDirection: "column", display: "flex" }}
    >
      <Container
        space="small"
        style={{ display: "flex", flexDirection: "column", flex: 1 }}
      >
        <VerticalSpace space="small" />
        <div
          style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}
        >
          <AutoSizeTextInput
            id="feedback"
            autoFocus={true}
            disabled={isLoading}
            placeholder="How can we improve? ☺️"
            grow={false}
            spellCheck={false}
            variant="border"
            value={feedback || ""}
            onValueInput={(val: string) => {
              dispatch({ type: "SET_FEEDBACK", payload: val });
            }}
            onFocusCapture={() => {
              dispatch({ type: "SET_ERROR", payload: "" });

              setWasSuccessful(false);
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
          {wasSuccessful && (
            <Banner icon={<IconCheckCircle32 />} variant="success">
              Feedback sent. Thank you for taking the time! 🤍
            </Banner>
          )}

          <Button
            loading={isLoading}
            disabled={isLoading}
            fullWidth
            onClick={handleSendFeedback}
          >
            Share feedback
          </Button>
        </div>

        <VerticalSpace space="small" />
      </Container>
    </motion.div>
  );
}
