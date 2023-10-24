import { h } from "preact";
import {
  Container,
  SegmentedControl,
  Stack,
  Text,
  Textbox,
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
  IconLockLocked16,
  Toggle,
} from "@create-figma-plugin/ui";
import { motion } from "framer-motion";

import { pluginContext } from "./PluginContext";
import { GPTModels } from "../fetchDiagramData";
import { RELEASE_VERSION } from "../constants";
import { getBaseUrl } from "../util";
import Logo from "./Logo";
import { tabTransition } from "../animations";

export function SettingsView() {
  const {
    state: {
      model,
      licenseKey,
      showRequired,
      orientation,
      showSuggestions,
      lastPrimaryTab,
    },
    dispatch,
  } = pluginContext();

  const licenseKeyInput = (
    <Columns space="extraLarge">
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
            <Link target="_window" href={getBaseUrl()}>
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
          dispatch({
            type: "SET_LICENSE_KEY",
            payload: val,
          });
        }}
        onFocusCapture={() => {
          dispatch({ type: "SET_SHOW_REQUIRED", payload: false });
          dispatch({ type: "SET_ERROR", payload: "" });
        }}
        style={{ cursor: "text", flexGrow: 0, flexShrink: 1, display: "flex" }}
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
            dispatch({ type: "SET_ORIENTATION", payload: val });
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
          <Muted>GPT 4 is usually better but slower and pricier</Muted>
        </Text>
      </Stack>
      <div style={{ float: "right" }}>
        <SegmentedControl
          value={model}
          onValueChange={(val: GPTModels) => {
            dispatch({ type: "SET_MODEL", payload: val });
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

  const showSuggestionsRow = (
    <Columns space="small">
      <Stack space="small">
        <Text>
          <Bold>Examples</Bold>{" "}
        </Text>
        <Text>
          <Muted>Show example prompts in the Generate tab</Muted>
        </Text>
      </Stack>
      <div style={{ float: "right" }}>
        <Toggle
          value={showSuggestions}
          onValueChange={(val: boolean) => {
            dispatch({ type: "SET_SHOW_SUGGESTIONS", payload: val });
          }}
        >
          {}
        </Toggle>
      </div>
    </Columns>
  );

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 1,
        x: lastPrimaryTab === "Generate" ? 10 : -10,
      }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{
        opacity: 0,
        scale: 1,
        x: lastPrimaryTab === "Generate" ? -10 : 10,
      }}
      transition={tabTransition}
      style={{ flex: 1, flexDirection: "column", display: "flex" }}
    >
      <Container space="small">
        <VerticalSpace space="medium" />
        <Stack space="large">
          {licenseKeyInput}
          <Divider />
          {modelSelection}
          <Divider />
          {showSuggestionsRow}
          <Divider />
        </Stack>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            position: "absolute",
            bottom: 0,
            left: 0,
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 8,
              alignItems: "center",
            }}
          >
            <Logo size={16} />
            <Muted>{RELEASE_VERSION}</Muted>
          </div>
        </div>
      </Container>
    </motion.div>
  );
}
