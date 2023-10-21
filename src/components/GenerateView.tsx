import { h } from "preact";
import { motion } from "framer-motion";

import { ModifyView } from "./ModifyView";
import WarningBanner from "./WarningBanner";
import { pluginContext } from "./PluginContext";
import { NaturalInputView } from "./NaturalInputView";
import { tabTransition } from "../animations";

export function GenerateView() {
  const { selectedDiagramNodeId, error } = pluginContext().state;
  return (
    <motion.div
      style={{ display: "flex", flexDirection: "column", flex: 1 }}
      initial={{ opacity: 0, scale: 1, x: -10 }}
      transition={tabTransition}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 1, x: 10 }}
    >
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
    </motion.div>
  );
}
