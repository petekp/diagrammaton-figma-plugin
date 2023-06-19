import { h } from "preact";
import {
  Container,
  SegmentedControl,
  Stack,
  Text,
  Textbox,
  TextboxMultiline,
  VerticalSpace,
  IconArrowUp16,
  IconArrowDown16,
  IconArrowLeft16,
  IconArrowRight16,
  Muted,
  Bold,
  Divider,
  Columns,
} from "@create-figma-plugin/ui";
import { pluginContext } from "./PluginContext";

export function SettingsView({ showRequired }: { showRequired: boolean }) {
  const {
    model,
    setModel,
    apiKey,
    setAPIKey,
    customPrompt,
    setCustomPrompt,
    clearErrors,
    orientation,
    setOrientation,
  } = pluginContext();

  const apiKeyInput = (
    <Columns space="small">
      <Stack space="small">
        <Text>
          <Bold>OpenAI API key</Bold>{" "}
          {showRequired && (
            <span style={{ marginLeft: 4, fontWeight: 600, color: "#E95324" }}>
              ← Required
            </span>
          )}
        </Text>
        <Text>
          <Muted>Encrypted and persisted on your device</Muted>
        </Text>
      </Stack>

      <Textbox
        spellCheck={false}
        variant="border"
        password={true}
        value={apiKey}
        onValueInput={(val: string) => {
          setAPIKey(val);
        }}
        onFocusCapture={() => {
          clearErrors();
        }}
      />
    </Columns>
  );

  const orientationSelection = (
    <Columns space="small">
      <Stack space="small">
        <Text>
          <Bold>Diagram direction</Bold>
        </Text>
        <Text>
          <Muted>The directional orientation from start to end</Muted>
        </Text>
      </Stack>
      <SegmentedControl
        value={orientation}
        onValueChange={(val: string) => {
          setOrientation(val);
        }}
        options={[
          {
            children: <IconArrowRight16 />,
            value: "LR",
          },
          {
            children: <IconArrowLeft16 />,
            value: "RL",
          },
          {
            children: <IconArrowDown16 />,
            value: "TB",
          },
          {
            children: <IconArrowUp16 />,
            value: "BT",
          },
        ]}
      />
    </Columns>
  );

  const customPromptInput = (
    <Stack space="small">
      <Text>Custom Prompt</Text>
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
    </Stack>
  );

  const modelSelection = (
    <Columns space="small">
      <Stack space="small">
        <Text>
          <Bold>Model</Bold>{" "}
        </Text>
        <Text>
          <Muted>GPT 4 is usually more accurate, but slower</Muted>
        </Text>
      </Stack>
      <SegmentedControl
        value={model}
        onValueChange={(val: string) => {
          setModel(val);
        }}
        options={[
          {
            value: "GPT 3.5",
          },
          {
            value: "GPT 4",
          },
        ]}
      />
    </Columns>
  );
  return (
    <Container space="small">
      <VerticalSpace space="medium" />
      <Stack space="large">
        {apiKeyInput}
        <Divider />
        {/* {customPromptInput} */}
        {orientationSelection}
        <Divider />
        {modelSelection}
      </Stack>
    </Container>
  );
}
