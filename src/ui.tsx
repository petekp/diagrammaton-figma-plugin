import {
  Banner,
  Button,
  Columns,
  Container,
  IconWarning32,
  render,
  Text,
  TextboxMultiline,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { createDiagram } from "./createDiagramClient";
import { emit, once, on } from "@create-figma-plugin/utilities";
import { h, JSX } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";

// @ts-ignore
import parser from "./grammar.js";

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
  const [input, setInput] =
    useState<string>(`Start[Start] --> EnterDetails[Enter User Details]
EnterDetails --> ValidateDetails[Validate Details]
ValidateDetails -- Details Valid --> SendVerificationEmail[Send Verification Email]
ValidateDetails -- Details Invalid --> ErrorDetails[Show Error Message]
ErrorDetails --> EnterDetails
SendVerificationEmail --> VerifyEmail[Verify Email]
VerifyEmail -- Email Not Verified --> SendVerificationEmail
VerifyEmail -- Email Verified --> AcceptTOS[Accept Terms of Service]
AcceptTOS -- TOS Not Accepted --> End[End: User Exits]
AcceptTOS -- TOS Accepted --> ConfirmAccount[Confirm Account]
ConfirmAccount -- Account Not Confirmed --> SendConfirmationEmail[Send Confirmation Email]
SendConfirmationEmail --> ConfirmAccount
ConfirmAccount -- Account Confirmed --> End[End: Signup Complete]`);
  const [numNodesSelected, setNumNodesSelected] = useState<number>(0);

  const [error, setError] = useState<string>("");
  const [showRequired, setShowRequired] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    emit<SetUILoaded>("SET_UI_LOADED");
  }, []);

  const handleExecutePlugin = useCallback(
    async function () {
      setError("");
      setShowRequired(false);
      console.log(input);
      let result = parser.parse(input);
      console.log("parsed result:", result);
      const positionsObject = await createDiagram(result);

      emit<ExecutePlugin>("EXECUTE_PLUGIN", {
        diagram: result,
        positionsObject,
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
        {/* <Text>
          OpenAI API Key{" "}
          {showRequired && (
            <span style={{ marginLeft: 4, fontWeight: 600, color: "#E95324" }}>
              ← Required
            </span>
          )}
        </Text> */}

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
            <span className={styles.warningBanner}>
              {parseTextWithUrl(error)}
            </span>
          </Banner>
        )}
        <VerticalSpace space="small" />
        <Button loading={isLoading} fullWidth onClick={handleExecutePlugin}>
          Create Diagram
        </Button>
        <VerticalSpace space="large" />
      </Container>
    </div>
  );
}

export default render(Plugin);
