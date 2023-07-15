import { h } from "preact";
import { pluginContext } from "./PluginContext";
import { useCallback } from "preact/hooks";
import {
  Banner,
  Button,
  Columns,
  Container,
  IconWarning32,
  Stack,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";

// @ts-ignore
import parser from "../lib/grammar.js";
import { gpt } from "../gpt";
import { AutoSizeTextInput } from "./AutoSizeTextInput";
import { TEXT_AREA_HEIGHT } from "../constants";
import { ExecutePlugin } from "../types";
import { createDiagram } from "../createDiagramClient";
import styles from "./styles.css";

export function NaturalInputView() {
  const {
    error,
    setError,
    setShowRequired,
    setDiagramSyntax,
    isLoading,
    setIsLoading,
    apiKey,
    orientation,
    naturalInput,
    setNaturalInput,
    diagramSyntax,
    numNodesSelected,
    model,
  } = pluginContext();

  const handleGetCompletions = useCallback(async () => {
    setError("");
    setIsLoading(true);
    try {
      const gptOutput = await gpt({ apiKey, model, input: naturalInput });

      setDiagramSyntax(gptOutput);

      await handleExecutePlugin(gptOutput);
    } catch (err) {
      console.log({ err });
      // @ts-ignore-next
      setError(err.message || err || "There was an error");
    } finally {
      setIsLoading(false);
    }
  }, [naturalInput, apiKey]);

  const handleExecutePlugin = useCallback(
    async function (input: string) {
      console.log("create natural diagram");
      let result = parser.parse(input);
      const positionsObject = await createDiagram({
        parsedOutput: result,
        orientation,
      });

      emit<ExecutePlugin>("EXECUTE_PLUGIN", {
        diagram: result,
        positionsObject,
        syntax: diagramSyntax,
      });
    },
    [naturalInput]
  );

  return (
    <Container space="small">
      <VerticalSpace space="small" />
      <Stack space="small">
        <AutoSizeTextInput
          disabled={isLoading}
          style={{
            lineHeight: 1.3,
            height: TEXT_AREA_HEIGHT,
          }}
          placeholder="Describe a diagram"
          grow={false}
          spellCheck={false}
          variant="border"
          value={naturalInput}
          onValueInput={(val: string) => {
            setNaturalInput(val);
          }}
          onFocusCapture={() => {
            setError("");
            setShowRequired(false);
          }}
        />

        {error && (
          <Banner
            className={styles.warningBanner}
            icon={<IconWarning32 />}
            variant="warning"
          >
            <span className={styles.warningBanner}>{error}</span>
          </Banner>
        )}
        {numNodesSelected > 0 ? (
          <Columns space="small">
            <Button fullWidth onClick={() => {}}>
              Expand
            </Button>
            <Button fullWidth onClick={() => {}}>
              Remix
            </Button>
          </Columns>
        ) : (
          <Button loading={isLoading} fullWidth onClick={handleGetCompletions}>
            Generate
          </Button>
        )}
      </Stack>
    </Container>
  );
}
