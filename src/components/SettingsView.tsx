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
  Link,
  Bold,
  Divider,
  Columns,
} from "@create-figma-plugin/ui";
import { pluginContext } from "./PluginContext";
import { GPTModels } from "../fetchDiagramData";

export function SettingsView({ showRequired }: { showRequired: boolean }) {
  const {
    model,
    setModel,
    licenseKey,
    setLicenseKey,
    customPrompt,
    setCustomPrompt,
    clearErrors,
    orientation,
    setOrientation,
  } = pluginContext();

  const licenseKeyInput = (
    <Columns space="small">
      <Stack space="small">
        <Text>
          <Bold>License key</Bold>{" "}
          {showRequired && (
            <span style={{ marginLeft: 4, fontWeight: 600, color: "#E95324" }}>
              ← Required
            </span>
          )}
        </Text>
        <Text>
          <Muted>
            <Link target="_window" href="https://figma-plugins-pete.vercel.app">
              Get a license key
            </Link>
          </Muted>
        </Text>
      </Stack>

      <Textbox
        spellCheck={false}
        variant="border"
        password={true}
        value={licenseKey}
        onValueInput={(val: string) => {
          setLicenseKey(val);
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
      <div style={{ float: "right" }}>
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
              children: <IconArrowDown16 />,
              value: "TB",
            },
            {
              children: <IconArrowLeft16 />,
              value: "RL",
            },

            {
              children: <IconArrowUp16 />,
              value: "BT",
            },
          ]}
        />
      </div>
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
          <Muted>GPT 4 is often more accurate but slower</Muted>
        </Text>
      </Stack>
      <div style={{ float: "right" }}>
        <SegmentedControl
          value={model}
          onValueChange={(val: keyof typeof GPTModels) => {
            setModel(val);
          }}
          options={[
            {
              children: "GPT 3.5",
              value: "gpt3",
            },
            {
              children: "GPT 4",
              value: "gpt4",
            },
          ]}
        />
      </div>
    </Columns>
  );
  return (
    <Container space="small">
      <VerticalSpace space="medium" />
      <Stack space="large">
        {licenseKeyInput}
        <Divider />
        {/* {customPromptInput} */}
        {orientationSelection}
        <Divider />
        {modelSelection}
      </Stack>
    </Container>
  );
}
