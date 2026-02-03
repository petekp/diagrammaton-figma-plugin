import { h } from "preact";
import { AnimatePresence, motion } from "framer-motion";
import { IconClose24, IconWarningSmall24 } from "@create-figma-plugin/ui";

import styles from "./styles.css";
import { pluginContext } from "./PluginContext";
import { CSSProperties } from "preact/compat";

const errorVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: 0,
  },
};

function WarningBanner({ style = {} }: { style?: CSSProperties }) {
  const {
    state: { error, isNewUser },
    clearErrors,
  } = pluginContext();

  return (
    <AnimatePresence>
      {error ? (
        <motion.div
          id="error"
          layout
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={errorVariants}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={styles.warningBanner}
          style={isNewUser ? { bottom: 16 } : {}}
        >
          <IconWarningSmall24 />
          <motion.div className={styles.warningText}>{error}</motion.div>
          <IconClose24 onClick={clearErrors} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default WarningBanner;
