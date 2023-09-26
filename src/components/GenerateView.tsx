import { h } from "preact";

import { NaturalInputView } from "./NaturalInputView";

export function GenerateView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <NaturalInputView />
    </div>
  );
}
