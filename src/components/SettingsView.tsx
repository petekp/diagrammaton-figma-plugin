import { h } from "preact";
import {
  Container,
  SegmentedControl,
  Text,
  Textbox,
  TextboxMultiline,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { pluginContext } from "./PluginContext";

export function SettingsView({ showRequired }: { showRequired: boolean }) {
  const {
    model,
    setModel,
    error,
    setError,
    apiKey,
    setAPIKey,
    customPrompt,
    setCustomPrompt,
    clearErrors,
  } = pluginContext();

  const apiKeyInput = (
    <div>
      <Text>
        OpenAI API Key{" "}
        {showRequired && (
          <span style={{ marginLeft: 4, fontWeight: 600, color: "#E95324" }}>
            ← Required
          </span>
        )}
      </Text>
      <VerticalSpace space="small" />
      <Textbox
        spellCheck={false}
        variant="border"
        value={apiKey}
        onValueInput={(val: string) => {
          setAPIKey(val);
        }}
        onFocusCapture={() => {
          clearErrors();
        }}
      />
    </div>
  );

  const customPromptInput = (
    <div>
      <Text>Custom Prompt</Text>
      <VerticalSpace space="small" />
      <TextboxMultiline
        spellCheck={false}
        variant="border"
        value={customPrompt}
        onValueInput={(val: string) => {
          setCustomPrompt(val);
        }}
        onFocusCapture={() => {
          clearErrors();
        }}
      />
    </div>
  );

  const modelSelection = (
    <div>
      <Text>Model</Text>
      <VerticalSpace space="small" />
      <SegmentedControl
        options={[
          {
            value: "GPT 3.5",
          },
          {
            value: "GPT 4",
          },
        ]}
        value={model}
        onValueChange={(val: string) => {
          setModel(val);
        }}
      />
    </div>
  );
  return (
    <Container space="medium">
      <VerticalSpace space="medium" />
      {apiKeyInput}
      <VerticalSpace space="medium" />
      {customPromptInput}
      <VerticalSpace space="medium" />
      {modelSelection}
      <VerticalSpace space="medium" />
    </Container>
  );
}
