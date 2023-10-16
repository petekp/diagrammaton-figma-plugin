import { useState, useEffect, useRef } from "preact/hooks";
import { TextboxMultiline, useInitialFocus } from "@create-figma-plugin/ui";
import { ComponentProps, h } from "preact";

export const AutoSizeTextInput = (
  props: ComponentProps<typeof TextboxMultiline>
) => {
  const [fontSize, setFontSize] = useState(20);

  useEffect(() => {
    const newFontSize = Math.max(14, 20 - props.value.length / 80);
    setFontSize(newFontSize);
  }, [props.value]);

  useEffect(() => {
    const textarea = document.querySelector("textarea");
    if (textarea) {
      textarea.focus();
    }
  }, []);

  return (
    <TextboxMultiline
      {...props}
      style={{
        flex: 1,
        ...(props.style as {}),
        padding: "12px 16px",
        fontSize: `${fontSize}px`,
        cursor: "text",
      }}
    />
  );
};
