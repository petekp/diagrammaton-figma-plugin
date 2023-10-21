import { h } from "preact";
import { motion } from "framer-motion";

import { ModifyView } from "./ModifyView";
import WarningBanner from "./WarningBanner";
import { pluginContext } from "./PluginContext";
import { NaturalInputView } from "./NaturalInputView";

export function GenerateView() {
  const { selectedDiagramNodeId, error } = pluginContext().state;
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      {selectedDiagramNodeId ? (
        <motion.div
          style={{ display: "flex", flexDirection: "column", flex: 1 }}
        >
          <ModifyView />
        </motion.div>
      ) : (
        <motion.div
          style={{ display: "flex", flexDirection: "column", flex: 1 }}
        >
          <NaturalInputView />
        </motion.div>
      )}
      {error && <WarningBanner />}
    </div>
  );
}
