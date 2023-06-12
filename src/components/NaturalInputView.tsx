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

import styles from "./styles.css";

// @ts-ignore
import parser from "../lib/grammar.js";
import { gpt } from "../gpt";

const removeStringsFromArray = (
  inputString: string,
  stringsToRemove: string[]
) => {
  let result = inputString;
  stringsToRemove.forEach((str) => {
    result = result.split(str).join("");
  });
  return result;
};

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

export function NaturalInputView() {
  const {
    setNumNodesSelected,
    settings,
    setSettings,
    error,
    setError,
    setShowRequired,
    setDiagramSyntax,
    isLoading,
    setIsLoading,
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

  once<GetSettings>("GET_SETTINGS", setSettings);
  on<HandleError>("HANDLE_ERROR", handleError);
  on<SetLoading>("SET_LOADING", setIsLoading);
  on<SetSelectedNodes>("SET_SELECTED_NODES", setNumNodesSelected);

  const handleGetCompletions = useCallback(async () => {
    setError("");
    setIsLoading(true);
    try {
      const completion = await gpt({ input });
      const badStrings = ["```"];
      const sanitizedCompletion = removeStringsFromArray(
        completion,
        badStrings
      );
      console.log("sanitized completion: ", sanitizedCompletion);

      setDiagramSyntax(sanitizedCompletion);
      await handleExecutePlugin(sanitizedCompletion);
    } catch (err) {
      console.log({ err });
      // @ts-ignore-next
      setError(err.message || err || "There was an error");
    } finally {
      setIsLoading(false);
    }
  }, [input]);

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
        <TextboxMultiline
          grow={true}
          rows={10}
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
