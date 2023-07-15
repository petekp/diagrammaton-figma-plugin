export const removeStringsFromArray = (
  inputString: string,
  stringsToRemove: string[]
) => {
  let result = inputString;
  stringsToRemove.forEach((str) => {
    result = result.split(str).join("");
  });
  return result;
};

export function generateRandomHex(size: number) {
  const characters = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < size; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function generateTimeBasedUUID() {
  const time = Date.now();
  const uuid = "x2xxyxxz".replace(/[xy]/g, (c) => {
    const r = (time + Math.random() * 16) % 16 | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}
