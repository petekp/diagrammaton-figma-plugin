import { h } from "preact";
import { AnimatePresence, motion } from "framer-motion";

import { ModifyView } from "./ModifyView";
import WarningBanner from "./WarningBanner";
import { pluginContext } from "./PluginContext";
import { NaturalInputView } from "./NaturalInputView";
import { tabTransition } from "../animations";

export function GenerateView() {
  const { selectedDiagramNodeId, error, lastPrimaryTab, currentPrimaryTab } =
    pluginContext().state;

  const shouldAnimate = currentPrimaryTab === "Generate";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1, x: -10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 1, x: 10 }}
      transition={tabTransition}
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        position: "relative",
      }}
    >
      <AnimatePresence>
        {selectedDiagramNodeId ? (
          <motion.div
            initial={{
              opacity: 0,
            }}
            transition={tabTransition}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: 99,
              background: "white",
            }}
          >
            <ModifyView />
          </motion.div>
        ) : (
          <motion.div
            initial={{
              opacity: 0,
            }}
            transition={tabTransition}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              zIndex: 9,
            }}
          >
            <NaturalInputView />
          </motion.div>
        )}
      </AnimatePresence>
      {error && <WarningBanner />}
    </motion.div>
  );
}
