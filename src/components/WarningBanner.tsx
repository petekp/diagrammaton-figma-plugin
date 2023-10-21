import { h } from "preact";
import { motion } from "framer-motion";
import { IconCross32, IconWarning32 } from "@create-figma-plugin/ui";

import styles from "./styles.css";
import { pluginContext } from "./PluginContext";

const errorVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.92,
  },
};

function WarningBanner() {
  const {
    state: { error },
    clearErrors,
  } = pluginContext();

  return (
    <motion.div
      id="error"
      layout
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={errorVariants}
      transition={{ type: "spring", damping: 20, stiffness: 200 }}
      className={styles.warningBanner}
    >
      <IconWarning32 />
      <motion.div className={styles.warningText}>{error}</motion.div>
      <IconCross32 onClick={clearErrors} />
    </motion.div>
  );
}

export default WarningBanner;
