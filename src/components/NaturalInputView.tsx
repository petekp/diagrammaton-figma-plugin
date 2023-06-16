import { h } from "preact";
import { pluginContext } from "./PluginContext";
import { useCallback, useState } from "preact/hooks";
import {
  Banner,
  Button,
  Columns,
  Container,
  IconWarning32,
  TextboxMultiline,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit, on, once } from "@create-figma-plugin/utilities";
import {
  ExecutePlugin,
  GetSettings,
  HandleError,
  SetLoading,
  SetSelectedNodes,
} from "../types";
import { createDiagram } from "../createDiagramClient";
import { removeStringsFromArray } from "../util";

import styles from "./styles.css";

// @ts-ignore
import parser from "../lib/grammar.js";
import { gpt } from "../gpt";
import { AutoSizeTextInput } from "./AutoSizeTextInput";

export function NaturalInputView() {
  const {
    error,
    setError,
    setShowRequired,
    setDiagramSyntax,
    isLoading,
    setIsLoading,
    apiKey,
  } = pluginContext();

  const [input, setInput] = useState<string>(
    `a basic sign up flow for a patient app`
  );

  const handleError = useCallback(
    function (error: string) {
      setError(error);
      setIsLoading(false);
    },
    [error]
  );

  const handleGetCompletions = useCallback(async () => {
    setError("");
    setIsLoading(true);
    try {
      console.log("handleGetCompletions apiKey: ", apiKey);
      const steps = await gpt({ apiKey, input });

      console.log("sanitized completion: ", steps);

      setDiagramSyntax(steps);

      await handleExecutePlugin(steps);
    } catch (err) {
      console.log({ err });
      // @ts-ignore-next
      setError(err.message || err || "There was an error");
    } finally {
      setIsLoading(false);
    }
  }, [input, apiKey]);

  const handleExecutePlugin = useCallback(
    async function (input: string) {
      let result = parser.parse(input);
      const positionsObject = await createDiagram(result);

      emit<ExecutePlugin>("EXECUTE_PLUGIN", {
        diagram: result,
        positionsObject,
      });
    },
    [input]
  );

  return (
    <Container
      space="medium"
      style={{ pointerEvents: isLoading ? "none" : "all" }}
    >
      <VerticalSpace space="small" />
      <Columns space="extraSmall">
        <AutoSizeTextInput
          style={{
            fontSize: 20,
            padding: "15px 10px",
            lineHeight: 1.3,
            height: 130,
          }}
          grow={false}
          spellCheck={false}
          variant="border"
          value={input}
          onValueInput={(val: string) => {
            setInput(val);
          }}
          onFocusCapture={() => {
            setError("");
            setShowRequired(false);
          }}
        />
      </Columns>

      {error && <VerticalSpace space="small" />}

      {error && (
        <Banner
          className={styles.warningBanner}
          icon={<IconWarning32 />}
          variant="warning"
        >
          <span className={styles.warningBanner}>{error}</span>
        </Banner>
      )}
      <VerticalSpace space="small" />
      <Button loading={isLoading} fullWidth onClick={handleGetCompletions}>
        Generate Diagram
      </Button>
      <VerticalSpace space="large" />
    </Container>
  );
}
