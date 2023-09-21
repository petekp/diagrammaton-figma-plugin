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

export function CreateView() {
  const { currentCreateTab, setCurrentCreateTab, isLoading } = pluginContext();

  return (
    <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>

      <NaturalInputView />
    </div>
  );
}
