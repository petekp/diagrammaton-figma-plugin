import { Tabs, TabsOption } from "@create-figma-plugin/ui";
import { Fragment, h, JSX } from "preact";

import { pluginContext } from "./PluginContext";
import { SettingsView } from "./SettingsView";
import { CreateView } from "./CreateView";
import { PrimaryTab } from "../types";
import { FeedbackView } from "./FeedbackView";
import SignIn from "./SignIn";
import LoadingSettingsOverlay from "./LoadingSettingsOverlay";
import styles from "./styles.css";
import debug from "../debug";
import { MotionDiv, AnimatePresence } from "./Motion";

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
      transition: { delay: 0.5 },
    },
  };

  console.log("isPersistedStateLoading", isPersistedStateLoading);
  console.log("isNewUser", isNewUser);

  const showLoading = !(
    isPersistedStateLoading === false && debug.isLoadingSettings === false
  );

  return (
    <Fragment>
      <AnimatePresence>
        {showLoading && (
          <MotionDiv
            className={styles.fullScreen}
            style={{ zIndex: 100 }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingSettingsOverlay />
          </MotionDiv>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isNewUser && (
          <MotionDiv
            className={styles.fullScreen}
            style={{ zIndex: 50 }}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
          >
            <SignIn />
          </MotionDiv>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!isNewUser && !isPersistedStateLoading && (
          <MotionDiv
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
          </MotionDiv>
        )}
      </AnimatePresence>
    </Fragment>
  );
}
