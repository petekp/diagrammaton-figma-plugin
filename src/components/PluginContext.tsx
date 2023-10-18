import { emit, on, once } from "@create-figma-plugin/utilities";
import { h, createContext, ComponentChildren } from "preact";
import { useContext, useEffect, useReducer } from "preact/hooks";

import {
  Action,
  GetPersistedState,
  HandleError,
  PersistedState,
  PluginState,
  SavePersistedState,
  SetLoading,
  SetSelectedNodesCount,
} from "../types";
import debug from "../debug";
import { useRef } from "react";

type PluginContextType = {
  state: PluginState;
  dispatch: React.Dispatch<Action>;
  clearErrors: () => void;
};

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export const pluginContext = () => {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error(
      "pluginContext must be used within an PluginContextProvider"
    );
  }
  return context;
};

export const PluginContextProvider = ({
  defaultSettings,
  children,
}: {
  defaultSettings: PersistedState;
  children?: ComponentChildren;
}) => {
  const initialState: PluginState = {
    ...defaultSettings,
    currentPrimaryTab: "Generate",
    error: "",
    isFigJam: false,
    isLoading: false,
    isPersistedStateLoading: false,
    numNodesSelected: 0,
    showRequired: false,
    showSuggestions: true,
  };

  once<GetPersistedState>("GET_PERSISTED_STATE", (state: PersistedState) => {
    dispatch({ type: "SET_LICENSE_KEY", payload: state.licenseKey });
    dispatch({ type: "SET_MODEL", payload: state.model });
    dispatch({ type: "SET_CUSTOM_PROMPT", payload: state.customPrompt });
    dispatch({ type: "SET_FEEDBACK", payload: state.feedback });
    dispatch({
      type: "SET_IS_NEW_USER",
      payload: debug.enabled ? debug.isNewUser : state.isNewUser,
    });
    dispatch({ type: "SET_NATURAL_INPUT", payload: state.naturalInput });
    dispatch({ type: "SET_ORIENTATION", payload: state.orientation });
    dispatch({
      type: "SET_SHOW_SUGGESTIONS",
      payload: debug.enabled ? debug.showSuggestions : state.showSuggestions,
    });

    // Hide overlay once state is loaded
    dispatch({ type: "SET_IS_PERSISTED_STATE_LOADING", payload: false });
  });

  const [state, dispatch] = useReducer<PluginState, Action>(
    (state, { type, payload }) => {
      switch (type) {
        case "SET_LICENSE_KEY":
          return { ...state, licenseKey: payload };
        case "SET_MODEL":
          return { ...state, model: payload };
        case "SET_CUSTOM_PROMPT":
          return { ...state, customPrompt: payload };
        case "SET_FEEDBACK":
          return { ...state, feedback: payload };
        case "SET_IS_NEW_USER":
          return { ...state, isNewUser: payload };
        case "SET_NATURAL_INPUT":
          return { ...state, naturalInput: payload };
        case "SET_ORIENTATION":
          return { ...state, orientation: payload };
        case "SET_IS_PERSISTED_STATE_LOADING":
          return { ...state, isPersistedStateLoading: payload };
        case "SET_IS_LOADING":
          return { ...state, isLoading: payload };
        case "SET_ERROR":
          return { ...state, error: payload };
        case "SET_NUM_NODES_SELECTED":
          return { ...state, numNodesSelected: payload };
        case "SET_SHOW_REQUIRED":
          return { ...state, showRequired: payload };
        case "SET_CURRENT_PRIMARY_TAB":
          return { ...state, currentPrimaryTab: payload };
        case "SET_IS_FIGJAM":
          return { ...state, isFigJam: payload };
        case "SET_SHOW_SUGGESTIONS":
          return { ...state, showSuggestions: payload };
        default:
          throw new Error();
      }
    },
    initialState
  );

  const { isPersistedStateLoading, ...restOfState } = state;

  useDeepCompareEffect(() => {
    if (!state.isPersistedStateLoading) {
      emit<SavePersistedState>("SAVE_PERSISTED_STATE", {
        ...defaultSettings,
        ...restOfState,
      });
    }
  }, [restOfState]);

  on<HandleError>("HANDLE_ERROR", (err) =>
    dispatch({ type: "SET_ERROR", payload: err })
  );
  on<SetLoading>("SET_LOADING", (isLoading) => {
    dispatch({ type: "SET_IS_LOADING", payload: isLoading });
  });
  on<SetSelectedNodesCount>("SET_SELECTED_NODES_COUNT", (num) =>
    dispatch({ type: "SET_NUM_NODES_SELECTED", payload: num })
  );
  on<SetSelectedNodesCount>("SET_SELECTED_NODES_COUNT", (num) =>
    dispatch({ type: "SET_NUM_NODES_SELECTED", payload: num })
  );

  const clearErrors = () => dispatch({ type: "SET_ERROR", payload: "" });

  return (
    <PluginContext.Provider value={{ state, dispatch, clearErrors }}>
      {children}
    </PluginContext.Provider>
  );
};

function useDeepCompareEffect(callback: () => void, dependencies: any[]) {
  const previousDependencies = useRef(dependencies);

  useEffect(() => {
    if (!areEqual(previousDependencies.current, dependencies)) {
      callback();
    }

    previousDependencies.current = dependencies;
  });
}

function areEqual(arr1: any[], arr2: any[]) {
  return JSON.stringify(arr1) === JSON.stringify(arr2);
}
