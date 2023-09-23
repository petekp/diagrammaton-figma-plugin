import { h } from "preact";
import styles from "./styles.css";
import { MiddleAlign } from "@create-figma-plugin/ui";
import { motion } from "framer-motion";

function LoadingSettingsOverlay() {
  return (
    <div className={styles.blurContainer}>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, delay: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
      >
        <MiddleAlign>Loading settings...</MiddleAlign>
      </motion.div>
    </div>
  );
}

export default LoadingSettingsOverlay;
