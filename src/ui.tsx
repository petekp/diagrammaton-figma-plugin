import { render } from "@create-figma-plugin/ui";

import { emit } from "@create-figma-plugin/utilities";
import { useEffect, useState } from "preact/hooks";
import { h } from "preact";

import { PluginContextProvider } from "./components/PluginContext";
import { PrimaryTabs } from "./components/PrimaryTabs";

import { PersistedState, SetUILoaded } from "./types";
import styles from "./components/styles.css";

function Plugin({ defaultSettings }: { defaultSettings: PersistedState }) {
  const [rendered, setRendered] = useState(false);
  useEffect(() => {
    if (!rendered) {
      console.log("first render");
      emit<SetUILoaded>("SET_UI_LOADED");
      setRendered(true);
    }
  }, []);

  return (
    <PluginContextProvider defaultSettings={defaultSettings}>
      <div className={styles.outerContainer}>
        <PrimaryTabs />
      </div>
    </PluginContextProvider>
  );
}

export default render(Plugin);
