import { useEffect } from "preact/hooks";
import { TextboxMultiline } from "@create-figma-plugin/ui";
import { ComponentProps, h } from "preact";
import { pluginContext } from "./PluginContext";
import { motion } from "framer-motion";
import { useDynamicFontSize } from "../hooks/useDynamicFontSize";

type Props = ComponentProps<typeof TextboxMultiline> & {
  autoFocus: boolean;
  id: string;
};

export const AutoSizeTextInput = (props: Props) => {
  const {
    state: { isLoading },
  } = pluginContext();

  const fontSize = useDynamicFontSize(props.value, props.id);

  console.log(fontSize);

  useEffect(() => {
    if (!props.autoFocus) return;

    const textarea = document.querySelector("textarea");
    if (textarea) {
      textarea.focus();
    }
  }, []);

  return (
    <motion.div
      initial={{ fontSize: fontSize }}
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
