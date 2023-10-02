const stepsString = '\\"steps\\": [\\n';

async function processStepsFromStream(
  readableStream: ReadableStream<Uint8Array>,
  callback: (jsonObj: any) => void
) {
  const reader = readableStream.getReader();
  let buffer = "";
  let inStepsArray = false;
  let jsonBuffer = "";
  let braceCount = 0; // Added this line

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    const chunk = new TextDecoder().decode(value);
    buffer += chunk;

    // Look for the start of the "steps" array.
    if (!inStepsArray) {
      const stepsStart = buffer.indexOf(stepsString);
      if (stepsStart !== -1) {
        inStepsArray = true;
        buffer = buffer.slice(stepsStart + 12); // Skip the "steps: [" part
      }
    }

    if (inStepsArray) {
      for (let i = 0; i < buffer.length; i++) {
        const char = buffer[i];
        jsonBuffer += char;

        if (char === "{") {
          braceCount++;
        }
        if (char === "}") {
          braceCount--;
        }

        // If we find a closing brace and we are in the steps array,
        // and the brace count is zero, try parsing the JSON object.
        if (char === "}" && braceCount === 0) {
          // Clean the jsonBuffer
          const cleanedJsonBuffer = jsonBuffer
            .replace(/\\\"/g, '"')
            .replace(/\\n/g, "")
            .replace(/^[\s,]+/, "");
          try {
            const jsonObj = JSON.parse(cleanedJsonBuffer.trim());
            callback(jsonObj);
          } catch (err) {
            console.error("Failed to parse JSON:", err);
          }
          jsonBuffer = ""; // Reset the JSON buffer
        }
      }
      buffer = ""; // Reset the main buffer
    }
  }
}

export default processStepsFromStream;
