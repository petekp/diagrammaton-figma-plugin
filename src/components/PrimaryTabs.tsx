import { Tabs, TabsOption } from "@create-figma-plugin/ui";
import { Fragment, h, JSX } from "preact";

import { pluginContext } from "./PluginContext";
import { SettingsView } from "./SettingsView";
import { CreateView } from "./CreateView";
import { PrimaryTab } from "../types";
import { FeedbackView } from "./FeedbackView";
import SignIn from "./SignIn";
import LoadingSettingsOverlay from "./LoadingSettingsOverlay";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./styles.css";

export function PrimaryTabs() {
  const {
    currentPrimaryTab,
    setCurrentPrimaryTab,
    isNewUser,
    isPersistedStateLoading,
  } = pluginContext();

  function handleChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = event.currentTarget.value as PrimaryTab;
    setCurrentPrimaryTab(newValue);
  }

  const tabOptions: Array<TabsOption> = [
    {
      value: "Create",
      children: <CreateView />,
    },

    {
      value: "Feedback",
      children: <FeedbackView />,
    },
    {
      value: "Settings",
      children: <SettingsView />,
    },
  ];

  const variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
      transition: { delay: 1 }, // delay the exit
    },
  };

  console.log("isPersistedStateLoading", isPersistedStateLoading);
  console.log("isNewUser", isNewUser);

  return (
    <Fragment>
      <AnimatePresence>
        {isPersistedStateLoading && (
          <motion.div
            className={styles.fullScreen}
            style={{ zIndex: 100 }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
