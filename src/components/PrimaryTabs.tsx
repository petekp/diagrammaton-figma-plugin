import { Tabs, TabsOption, TabsProps } from "@create-figma-plugin/ui";
import { h, JSX } from "preact";
import { useState } from "preact/hooks";

import { NaturalInputView } from "./NaturalInputView";
import { SyntaxInputView } from "./SyntaxInputView";
import { pluginContext } from "./PluginContext";
import { SettingsView } from "./SettingsView";

export function PrimaryTabs() {
  const [currentTab, setCurrentTab] = useState<string>("Describe");
  const { showRequired } = pluginContext();

  function handleChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = event.currentTarget.value;
    setCurrentTab(newValue);
  }

  const tabOptions: Array<TabsOption> = [
    {
      value: "Describe",
      children: <NaturalInputView />,
    },
    {
      value: "Syntax",
      children: <SyntaxInputView />,
    },
    {
      value: "Settings",
      children: <SettingsView showRequired={showRequired} />,
    },
  ];

  return (
    <Tabs onChange={handleChange} options={tabOptions} value={currentTab} />
  );
}
