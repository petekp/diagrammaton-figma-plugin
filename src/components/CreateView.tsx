import { h } from "preact";
import { pluginContext } from "./PluginContext";
import {
  SegmentedControl,
  VerticalSpace,
  IconPencil32,
  IconCode32,
} from "@create-figma-plugin/ui";
import { CreateTab } from "../types";

import { NaturalInputView } from "./NaturalInputView";
import { SyntaxInputView } from "./SyntaxInputView";

export function CreateView() {
  const { currentCreateTab, setCurrentCreateTab, isLoading } = pluginContext();

  return (
    <div>
      <VerticalSpace space="extraSmall" />
      <div
        style={{
          textAlign: "center",
          position: "absolute",
          bottom: 68,
          right: 20,
          zIndex: 999,
        }}
      >
        <SegmentedControl
          disabled={isLoading}
          value={currentCreateTab}
          onValueChange={(val: CreateTab) => {
            setCurrentCreateTab(val);
          }}
          options={[
            {
              value: "Natural",
              children: <IconPencil32 />,
            },
            {
              value: "Syntax",
              children: <IconCode32 />,
            },
          ]}
        />
      </div>
      {currentCreateTab === "Natural" ? (
        <NaturalInputView />
      ) : (
        <SyntaxInputView />
      )}
    </div>
  );
}
