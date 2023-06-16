import { useState, useEffect } from "preact/hooks";
import { TextboxMultiline } from "@create-figma-plugin/ui";
import { ComponentProps, h } from "preact";

export const AutoSizeTextInput = (
  props: ComponentProps<typeof TextboxMultiline>
) => {
  const [fontSize, setFontSize] = useState(36);

  useEffect(() => {
    const newFontSize = Math.max(14, 24 - props.value.length / 24);
    setFontSize(newFontSize);
  }, [props.value]);

  return (
    <TextboxMultiline
      {...props}
      style={{
        ...(props.style as {}),
        fontSize: `${fontSize}px`,
      }}
    />
  );
};
