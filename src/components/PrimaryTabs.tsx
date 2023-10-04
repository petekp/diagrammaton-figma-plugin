import { Tabs, TabsOption } from "@create-figma-plugin/ui";
import { Fragment, h, JSX } from "preact";

import { pluginContext } from "./PluginContext";
import { SettingsView } from "./SettingsView";
import { GenerateView } from "./GenerateView";
import { PrimaryTab } from "../types";
import { FeedbackView } from "./FeedbackView";
import SignIn from "./SignIn";
import LoadingSettingsOverlay from "./LoadingSettingsOverlay";
import styles from "./styles.css";
import debug from "../debug";
import { AnimatePresence, motion } from "framer-motion";

export function PrimaryTabs() {
  const {
    state: { currentPrimaryTab, isNewUser, isPersistedStateLoading },
    dispatch,
  } = pluginContext();

  function handleChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = event.currentTarget.value as PrimaryTab;
    dispatch({ type: "SET_CURRENT_PRIMARY_TAB", payload: newValue });
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

  const showLoading = debug.enabled
    ? debug.isLoadingSettings
    : isPersistedStateLoading;

  return (
    <Fragment>
      <AnimatePresence>
        {showLoading && (
          <motion.div
            className={styles.fullScreen}
            style={{ zIndex: 100 }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            pm
          >
            <LoadingSettingsOverlay />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isNewUser && (
          <motion.div
            className={styles.fullScreen}
            style={{ zIndex: 50 }}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
          >
            <SignIn />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!isNewUser && !isPersistedStateLoading && (
          <motion.div
            className={styles.fullScreen}
            style={{ zIndex: 25 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Tabs
              onChange={handleChange}
              options={tabOptions}
              value={currentPrimaryTab}
              style={{ display: "flex", flexDirection: "column" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Fragment>
  );
}
