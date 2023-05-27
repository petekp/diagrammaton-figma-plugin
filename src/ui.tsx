import {
  Banner,
  Button,
  Columns,
  Container,
  IconWarning32,
  render,
  Text,
  Textbox,
  VerticalSpace,
  SegmentedControl,
  SegmentedControlOption,
} from "@create-figma-plugin/ui";
import { emit, once, on } from "@create-figma-plugin/utilities";
import { h, JSX } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";

import {
  ExecutePlugin,
  GetSettings,
  HandleError,
  SetLoading,
  SetSelectedNodes,
  SetUILoaded,
  Settings,
} from "./types";

import styles from "./styles.css";

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

function Plugin({ defaultSettings }: { defaultSettings: Settings }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const { isFigJam } = settings;
  const [input, setInput] = useState<string>("");
  const [numNodesSelected, setNumNodesSelected] = useState<number>(0);

  const [error, setError] = useState<string>("");
  const [showRequired, setShowRequired] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    emit<SetUILoaded>("SET_UI_LOADED");
  }, []);

  const handleExecutePlugin = useCallback(
    function () {
      setError("");
      setShowRequired(false);
      emit<ExecutePlugin>("EXECUTE_PLUGIN", {
        input,
      });
    },
    [input]
  );

  const handleError = useCallback(
    function (error: string) {
      setError(error);
      setIsLoading(false);
      setSettings({ ...settings });
    },
    [error]
  );

  once<GetSettings>("GET_SETTINGS", setSettings);
  on<HandleError>("HANDLE_ERROR", handleError);
  on<SetLoading>("SET_LOADING", setIsLoading);
  on<SetSelectedNodes>("SET_SELECTED_NODES", setNumNodesSelected);

  return (
    <div style={styles.outerContainer}>
      <VerticalSpace space="large" />

      <Container
        space="medium"
        style={{ pointerEvents: isLoading ? "none" : "all" }}
      >
        <Text>
          OpenAI API Key{" "}
          {showRequired && (
            <span style={{ marginLeft: 4, fontWeight: 600, color: "#E95324" }}>
              ← Required
            </span>
          )}
        </Text>

        <VerticalSpace space="small" />
        <Columns space="extraSmall">
          <Textbox
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
            <span className={styles.warningBanner}>
              {parseTextWithUrl(error)}
            </span>
          </Banner>
        )}
        <VerticalSpace space="small" />
        <Button loading={isLoading} fullWidth onClick={handleExecutePlugin}>
          Execute Plugin
        </Button>
        <VerticalSpace space="large" />
      </Container>
    </div>
  );
}

export default render(Plugin);
