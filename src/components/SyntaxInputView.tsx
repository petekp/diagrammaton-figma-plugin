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
    numNodesSelected,
    setNumNodesSelected,
    settings,
    setSettings,
    error,
    setError,
    showRequired,
    setShowRequired,
    isLoading,
    setIsLoading,
    isFigJam,
  } = pluginContext();

  const [input, setInput] =
    useState<string>(`Start((Start)) --> EnterDetails(Enter User Details)
EnterDetails --> ValidateDetails[Validate Details]
ValidateDetails -- Details Valid --> SendVerificationEmail[\\Send Verification Email/]
ValidateDetails -- Details Invalid --> ErrorDetails[/Show Error Message\\]
ErrorDetails --> EnterDetails
SendVerificationEmail --> VerifyEmail[(Verify Email)]
VerifyEmail -- Email Not Verified --> SendVerificationEmail
VerifyEmail -- Email Verified --> AcceptTOS[Accept Terms of Service]
AcceptTOS -- TOS Not Accepted --> End[End: User Exits]
AcceptTOS -- TOS Accepted --> ConfirmAccount[Confirm Account]
ConfirmAccount -- Account Not Confirmed --> SendConfirmationEmail[Send Confirmation Email]
SendConfirmationEmail --> ConfirmAccount
ConfirmAccount -- Account Confirmed --> End[End: Signup Complete]`);

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

  const handleExecutePlugin = useCallback(
    async function () {
      setError("");
      setShowRequired(false);
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
  );
}
