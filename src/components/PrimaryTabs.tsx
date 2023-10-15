import { Tabs, TabsOption } from "@create-figma-plugin/ui";
import { AnimatePresence, motion } from "framer-motion";
import { h, JSX } from "preact";

import LoadingSettingsOverlay from "./LoadingSettingsOverlay";
import { pluginContext } from "./PluginContext";
import { SettingsView } from "./SettingsView";
import { GenerateView } from "./GenerateView";
import { FeedbackView } from "./FeedbackView";
import { PrimaryTab } from "../types";
import styles from "./styles.css";
import SignIn from "./SignIn";
import debug from "../debug";

const variants = {
  hidden: { opacity: 0, delay: 0.5 },
  visible: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
    transition: { delay: 0.7 },
  },
};

export function PrimaryTabs() {
  const {
    state: { currentPrimaryTab, isNewUser, isPersistedStateLoading },
    dispatch,
  } = pluginContext();

  function handleChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    dispatch({
      type: "SET_CURRENT_PRIMARY_TAB",
      payload: event.currentTarget.value as PrimaryTab,
    });
  }

  const tabOptions: Array<TabsOption> = [
    {
      value: "Generate",
      children: <GenerateView />,
    },
    {
      value: "Settings",
      children: <SettingsView />,
    },
    {
      value: "Feedback",
      children: <FeedbackView />,
    },
  ];

  const showLoading = debug.enabled
    ? debug.isLoadingSettings
    : isPersistedStateLoading;

  const showTabs = !isNewUser && !showLoading;

  return (
    <AnimatePresence>
      {showLoading ? (
        <motion.div
          key="loading"
          className={styles.fullScreen}
          style={{ zIndex: 100 }}
          initial="visible"
          animate="visible"
          exit="exit"
          variants={variants}
        >
          <LoadingSettingsOverlay />
        </motion.div>
      ) : isNewUser ? (
        <motion.div
          key="sign-in"
          className={styles.fullScreen}
          style={{ zIndex: 50 }}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
        >
          <SignIn />
        </motion.div>
      ) : showTabs ? (
        <motion.div
          key="primary-tabs"
          className={styles.fullScreen}
          style={{ zIndex: 25 }}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
        >
          <Tabs
            onChange={handleChange}
            options={tabOptions}
            value={currentPrimaryTab}
            style={{ display: "flex", flexDirection: "column" }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
