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
  Checkbox,
  IconLockLocked16,
} from "@create-figma-plugin/ui";
import { pluginContext } from "./PluginContext";
import { GPTModels } from "../fetchDiagramData";

export function SettingsView() {
  const {
    model,
    setModel,
    licenseKey,
    setLicenseKey,
    showRequired,
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
            <Link target="_window" href="https://www.diagrammaton.com">
              View account
            </Link>
          </Muted>
        </Text>
      </Stack>

      <Textbox
        spellCheck={false}
        variant="border"
        password={true}
        icon={<IconLockLocked16 />}
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

  const modelSelection = (
    <Columns space="small">
      <Stack space="small">
        <Text>
          <Bold>Model</Bold>{" "}
        </Text>
        <Text>
          <Muted>GPT 4 is better but slower and pricier</Muted>
        </Text>
      </Stack>
      <div style={{ float: "right" }}>
        <SegmentedControl
          value={model}
          onValueChange={(val: GPTModels) => {
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
        {modelSelection}
        <Divider />
        {orientationSelection}
        <Divider />
        {licenseKeyInput}
      </Stack>
    </Container>
  );
}
