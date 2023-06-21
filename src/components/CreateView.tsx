import { h } from "preact";
import { pluginContext } from "./PluginContext";
import { SegmentedControl, VerticalSpace } from "@create-figma-plugin/ui";
import { CreateTab, ExecutePlugin } from "../types";

import { NaturalInputView } from "./NaturalInputView";
import { SyntaxInputView } from "./SyntaxInputView";

export function CreateView() {
  const { currentCreateTab, setCurrentCreateTab } = pluginContext();

  return (
    <div>
      <VerticalSpace space="extraSmall" />
      <div style={{ textAlign: "center" }}>
        <SegmentedControl
          value={currentCreateTab}
          onValueChange={(val: CreateTab) => {
            setCurrentCreateTab(val);
          }}
          options={[
            {
              value: "Natural",
            },
            {
              value: "Syntax",
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
