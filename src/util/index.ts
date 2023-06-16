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
