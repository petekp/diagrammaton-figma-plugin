import { useEffect } from "preact/hooks";
import { pluginContext } from "../components/PluginContext";

export const useDynamicFontSize = (value: string, id: string) => {
  const {
    state: { textareaFontSizeById },
    dispatch,
  } = pluginContext();
  const fontSize = textareaFontSizeById[id] || 20;

  useEffect(() => {
    const newFontSize = Math.max(14, 20 - value.length / 80);
    dispatch({
      type: "SET_TEXTAREA_FONT_SIZE_BY_ID",
      payload: { [id]: newFontSize },
    });
  }, [value]);

  return fontSize;
};
