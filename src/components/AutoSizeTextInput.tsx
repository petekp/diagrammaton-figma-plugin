import { useState, useEffect } from "preact/hooks";
import { TextboxMultiline } from "@create-figma-plugin/ui";
import { ComponentProps, h } from "preact";

export const AutoSizeTextInput = (
  props: ComponentProps<typeof TextboxMultiline>
) => {
  const [fontSize, setFontSize] = useState(20);

  useEffect(() => {
    const newFontSize = Math.max(14, 20 - props.value.length / 40);
    setFontSize(newFontSize);
  }, [props.value]);

  return (
    <TextboxMultiline
      {...props}
      style={{
        ...(props.style as {}),
        padding: "8px 12px",
        fontSize: `${fontSize}px`,
      }}
    />
  );
};
