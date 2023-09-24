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

import { AutoSizeTextInput } from "./AutoSizeTextInput";
import styles from "./styles.css";
import { useCallback, useState } from "preact/hooks";
import { sendFeedback } from "../sendFeedback";

export function FeedbackView() {
  const [wasSuccessful, setWasSuccessful] = useState(false);

  const {
    feedback,
    setFeedback,
    isLoading,
    error,
    setError,
    setShowRequired,
    licenseKey,
    setIsLoading,
  } = pluginContext();

  const handleSendFeedback = useCallback(async () => {
    if (!licenseKey) {
      setShowRequired(true);
      setError("Please enter a license key in Settings");
      return;
    }
    setError("");
    setIsLoading(true);
    setWasSuccessful(false);
    try {
      await sendFeedback({
        message: feedback,
        licenseKey,
      });
      setWasSuccessful(true);
      setFeedback("");
    } catch (err) {
      setWasSuccessful(false);
      if (err instanceof Error) {
        setError(err.message || "There was an error");
      }
    } finally {
      setIsLoading(false);
    }
  }, [feedback]);

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
          placeholder="What would make your experience better?"
          grow={false}
          spellCheck={false}
          variant="border"
          value={feedback || ""}
          onValueInput={(val: string) => {
            setFeedback(val);
          }}
          onFocusCapture={() => {
            setError("");
            setWasSuccessful(false);
          }}
        />

        {error && (
          <div className={styles.warningBanner}>
            <IconWarning32 />
            <div className={styles.warningText}>{error}</div>
            <IconCross32 onClick={() => setError("")} />
          </div>
        )}
        {wasSuccessful && (
          <Banner icon={<IconCheckCircle32 />} variant="success">
            Feedback sent. Appreciate it!
          </Banner>
        )}

        <Button loading={isLoading} fullWidth onClick={handleSendFeedback}>
          Share feedback
        </Button>
      </div>

      <VerticalSpace space="small" />
    </Container>
  );
}
