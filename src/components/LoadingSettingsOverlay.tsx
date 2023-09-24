import { h } from "preact";
import styles from "./styles.css";
import { LoadingIndicator, MiddleAlign } from "@create-figma-plugin/ui";
import { MotionDiv } from "./Motion";

function LoadingSettingsOverlay() {
  return (
    <div className={styles.blurContainer}>
      <MiddleAlign>
        <MotionDiv
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1.2 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <LoadingIndicator color="secondary" />
        </MotionDiv>
      </MiddleAlign>
    </div>
  );
}

export default LoadingSettingsOverlay;
