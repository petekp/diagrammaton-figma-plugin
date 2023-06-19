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
  TextboxMultiline,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { ExecutePlugin } from "../types";
import { createDiagram } from "../createDiagramClient";

import styles from "./styles.css";

// @ts-ignore
import parser from "../lib/grammar.js";
import { AutoSizeTextInput } from "./AutoSizeTextInput";
import { TEXT_AREA_HEIGHT } from "../constants";

const urlRegex = /(https?:\/\/[^\s]+)/g;

const parseTextWithUrl = (text: string) => {
  const parts = text.split(urlRegex);

  return parts.map((part, index) =>
    urlRegex.test(part) ? (
      <a key={index} href={part} target="_blank" rel="noopener noreferrer">
        {part}
      </a>
    ) : (
      part
    )
  );
};

export function SyntaxInputView() {
  const {
    error,
    setError,
    setShowRequired,
    isLoading,
    setDiagramSyntax,
    diagramSyntax,
  } = pluginContext();

  const handleExecutePlugin = useCallback(
    async function () {
      setError("");
      setShowRequired(false);
      let result = parser.parse(diagramSyntax);
      const positionsObject = await createDiagram(result);

      emit<ExecutePlugin>("EXECUTE_PLUGIN", {
        diagram: result,
        positionsObject,
      });
    },
    [diagramSyntax]
  );

  return (
    <Container space="small">
      <VerticalSpace space="small" />
      <Stack space="small">
        <AutoSizeTextInput
          style={{ height: TEXT_AREA_HEIGHT, lineHeight: 1.4 }}
          disabled={isLoading}
          grow={false}
          placeholder="Mermaid syntax will be output here (and can also be entered)"
          spellCheck={false}
          variant="border"
          value={diagramSyntax}
          onValueInput={(val: string) => {
            setDiagramSyntax(val);
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

        <Button loading={isLoading} fullWidth onClick={handleExecutePlugin}>
          Generate
        </Button>
      </Stack>
    </Container>
  );
}
