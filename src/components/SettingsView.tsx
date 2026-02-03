import { h } from "preact";
import {
  Button,
  Container,
  Dropdown,
  type DropdownOption,
  SegmentedControl,
  Stack,
  Text,
  Textbox,
  VerticalSpace,
  IconArrow16,
  Muted,
  Link,
  Bold,
  Divider,
  Columns,
  IconLockLocked16,
  Toggle,
} from "@create-figma-plugin/ui";
import { motion } from "framer-motion";
import { emit, saveSettingsAsync } from "@create-figma-plugin/utilities";
import { EventHandler } from "@create-figma-plugin/utilities";
import { useEffect, useMemo, useState } from "preact/hooks";

// Create a custom event type for clearing client storage
export interface ClearClientStorage extends EventHandler {
  name: "CLEAR_CLIENT_STORAGE";
  handler: () => void;
}

import { pluginContext } from "./PluginContext";
import { ModelId } from "../fetchDiagramData";
import { DEFAULT_MODEL_ID, RELEASE_VERSION } from "../constants";
import { getBaseUrl } from "../util";
import type { PersistedState } from "../types";
import { fetchModelOptions, type ModelOption } from "../fetchModelOptions";

const SETTINGS_KEY = "figjam-diagrammaton-plugin";

// Get isFigJam from current plugin state
const getDefaultSettings = (isFigJam: boolean): PersistedState => ({
  customPrompt: "",
  feedback: "",
  isFigJam,
  isNewUser: true, // Force true to ensure login screen shows
  isSignInVisible: false,
  licenseKey: "",
  model: DEFAULT_MODEL_ID,
  naturalInput: "",
  orientation: "LR",
  showSuggestions: true,
  modifyInput: "",
  textareaFontSizeById: {},
});
import Logo from "./Logo";
import { tabTransition } from "../animations";

export function SettingsView() {
  const {
    state: {
      model,
      isFigJam,
      licenseKey,
      showRequired,
      orientation,
      showSuggestions,
      lastPrimaryTab,
    },
    dispatch,
  } = pluginContext();

  const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);
  const [modelOptionsStatus, setModelOptionsStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");

  useEffect(() => {
    let isActive = true;

    if (!licenseKey) {
      setModelOptions([]);
      setModelOptionsStatus("idle");
      return () => {
        isActive = false;
      };
    }

    setModelOptionsStatus("loading");
    fetchModelOptions(licenseKey)
      .then((response) => {
        if (!isActive) return;
        const nextOptions = response.models ?? [];
        setModelOptions(nextOptions);
        setModelOptionsStatus("idle");

        if (nextOptions.length === 0) {
          return;
        }

        const optionIds = new Set(nextOptions.map((option) => option.id));
        if (!optionIds.has(model)) {
          const fallback =
            response.defaultModelId ?? nextOptions[0]?.id ?? DEFAULT_MODEL_ID;
          dispatch({ type: "SET_MODEL", payload: fallback });
        }
      })
      .catch(() => {
        if (!isActive) return;
        setModelOptionsStatus("error");
      });

    return () => {
      isActive = false;
    };
  }, [licenseKey, dispatch]);

  const modelDropdownOptions = useMemo(() => {
    const options: DropdownOption[] = [];
    const openaiOptions = modelOptions.filter(
      (option) => option.provider === "openai"
    );
    const anthropicOptions = modelOptions.filter(
      (option) => option.provider === "anthropic"
    );

    if (openaiOptions.length > 0) {
      options.push({ header: "OpenAI" });
      options.push(
        ...openaiOptions.map((option) => ({
          value: option.id,
          text: option.label,
        }))
      );
    }

    if (openaiOptions.length > 0 && anthropicOptions.length > 0) {
      options.push("-");
    }

    if (anthropicOptions.length > 0) {
      options.push({ header: "Anthropic" });
      options.push(
        ...anthropicOptions.map((option) => ({
          value: option.id,
          text: option.label,
        }))
      );
    }

    return options;
  }, [modelOptions]);

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
              children: <IconArrow16 />,
              value: "LR",
            },
            {
              children: <IconArrow16 />,
              value: "TB",
            },
            {
              children: <IconArrow16 />,
              value: "RL",
            },

            {
              children: <IconArrow16 />,
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
          <Muted>Loaded from your account keys</Muted>
        </Text>
      </Stack>
      <div style={{ float: "right" }}>
        <Dropdown
          disabled={
            !licenseKey ||
            modelOptionsStatus === "loading" ||
            modelDropdownOptions.length === 0
          }
          value={modelOptions.length > 0 ? model : null}
          placeholder={
            !licenseKey
              ? "Add license key to load models"
              : modelOptionsStatus === "loading"
                ? "Loading models..."
                : modelOptionsStatus === "error"
                  ? "Unable to load models"
                  : "No models available"
          }
          options={modelDropdownOptions}
          onValueChange={(val: string) => {
            dispatch({ type: "SET_MODEL", payload: val as ModelId });
          }}
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
          &nbsp;
        </Toggle>
      </div>
    </Columns>
  );

  const clearStorageRow = (
    <Columns space="small">
      <Stack space="small">
        <Text>
          <Bold>Clear Storage</Bold>{" "}
        </Text>
        <Text>
          <Muted>Clear all plugin data and settings for testing</Muted>
        </Text>
      </Stack>
      <div style={{ float: "right" }}>
        <Button
          onClick={async () => {
            if (
              confirm(
                "Are you sure you want to clear all plugin storage? This will reset all settings and authentication."
              )
            ) {
              // Tell main thread to clear Figma clientStorage
              emit("CLEAR_CLIENT_STORAGE");

              // Save default settings to force login screen on reload
              await saveSettingsAsync(
                getDefaultSettings(isFigJam),
                SETTINGS_KEY
              );

              // Force reset all state to ensure clean slate
              dispatch({ type: "SET_LICENSE_KEY", payload: "" });
              dispatch({ type: "SET_IS_NEW_USER", payload: true });
              dispatch({ type: "SET_IS_FIGJAM", payload: isFigJam });
              dispatch({ type: "SET_MODEL", payload: DEFAULT_MODEL_ID });
              dispatch({ type: "SET_CUSTOM_PROMPT", payload: "" });
              dispatch({ type: "SET_FEEDBACK", payload: "" });
              dispatch({ type: "SET_NATURAL_INPUT", payload: "" });
              dispatch({ type: "SET_ORIENTATION", payload: "LR" });
              dispatch({ type: "SET_SHOW_SUGGESTIONS", payload: true });
              dispatch({ type: "SET_MODIFY_INPUT", payload: "" });
              dispatch({
                type: "SET_TEXTAREA_FONT_SIZE_BY_ID",
                payload: { generate: 20, modify: 20 },
              });

              // Reload the plugin to reflect cleared state
              window.location.reload();
            }
          }}
        >
          Clear
        </Button>
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
          {clearStorageRow}
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
