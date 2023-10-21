import { useState, useEffect } from "preact/hooks";
import { TextboxMultiline } from "@create-figma-plugin/ui";
import { ComponentProps, h } from "preact";
import { pluginContext } from "./PluginContext";
import { motion } from "framer-motion";

type Props = ComponentProps<typeof TextboxMultiline> & {
  autoFocus: boolean;
};

export const AutoSizeTextInput = (props: Props) => {
  const {
    state: { isLoading },
  } = pluginContext();

  const [fontSize, setFontSize] = useState(20);

  useEffect(() => {
    const newFontSize = Math.max(14, 20 - props.value.length / 80);
    setFontSize(newFontSize);
  }, [props.value]);

  useEffect(() => {
    if (!props.autoFocus) return;

    const textarea = document.querySelector("textarea");
    if (textarea) {
      textarea.focus();
    }
  }, []);

  return (
    <motion.div
      initial={{ fontSize: 20 }}
      animate={{ fontSize: fontSize }}
      style={{ flex: 1, flexDirection: "column", display: "flex" }}
    >
      <TextboxMultiline
        {...props}
        style={{
          flex: 1,
          ...(props.style as {}),
          padding: "12px 14px",
          cursor: isLoading ? "default" : "text",
          lineHeight: 1.3,
        }}
      />
    </motion.div>
  );
};
