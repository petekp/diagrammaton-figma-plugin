import { h } from "preact";
import { Text } from "@create-figma-plugin/ui";

export function SettingsView({ showRequired }: { showRequired: boolean }) {
  return (
    <Text>
      OpenAI API Key{" "}
      {showRequired && (
        <span style={{ marginLeft: 4, fontWeight: 600, color: "#E95324" }}>
          ← Required
        </span>
      )}
    </Text>
  );
}
