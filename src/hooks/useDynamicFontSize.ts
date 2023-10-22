import { useState, useEffect, useLayoutEffect } from "preact/hooks";

let globalFontSizes = {} as Record<string, number>;

export const useDynamicFontSize = (value: string, id: string) => {
  const [fontSize, setFontSize] = useState(globalFontSizes[id] || 20);

  console.log(globalFontSizes);

  useLayoutEffect(() => {
    const newFontSize = Math.max(14, 20 - value.length / 80);
    setFontSize(newFontSize);
    globalFontSizes[id] = newFontSize;
  }, [value]);

  return fontSize;
};
