import { Tabs, TabsOption, TabsProps } from "@create-figma-plugin/ui";
import { h, JSX } from "preact";

import { pluginContext } from "./PluginContext";
import { SettingsView } from "./SettingsView";
import { CreateView } from "./CreateView";
import { PrimaryTab } from "../types";

export function PrimaryTabs() {
  const { showRequired, currentPrimaryTab, setCurrentPrimaryTab } =
    pluginContext();

  function handleChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = event.currentTarget.value as PrimaryTab;
    setCurrentPrimaryTab(newValue);
  }

  const tabOptions: Array<TabsOption> = [
    {
      value: "Create",
      children: <CreateView />,
    },
    {
      value: "Settings",
      children: <SettingsView showRequired={showRequired} />,
    },
  ];

  return (
    <Tabs
      onChange={handleChange}
      options={tabOptions}
      value={currentPrimaryTab}
    />
  );
}
