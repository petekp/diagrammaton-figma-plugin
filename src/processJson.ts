const stepsString = '\\"steps\\": [\\n';
const messageString = '\\"message\\":';

async function* processParametersFromStream(
  readableStream: ReadableStream<Uint8Array>
) {
  const reader = readableStream.getReader();
  let buffer = "";
  let jsonBuffer = "";
  let braceCount = 0;
  let inStepsArray = false;
  let inMessageArray = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      console.log("Stream ended.");
      break;
    }

    const chunk = new TextDecoder().decode(value);
    buffer += chunk;

    // console.log(buffer);

    if (!inStepsArray) {
      const stepsStart = buffer.indexOf(stepsString);
      if (stepsStart !== -1) {
        inStepsArray = true;
        buffer = buffer.slice(stepsStart + 12);
      }
    }

    if (!inMessageArray) {
      const messageStart = buffer.indexOf(messageString);
      if (messageStart !== -1) {
        inMessageArray = true;
        buffer = buffer.slice(messageStart + 9);
      }
    }

    if (inMessageArray) {
      console.log("inMessageArray");
      for (let i = 0; i < buffer.length; i++) {
        const char = buffer[i];
        jsonBuffer += char;
        console.log(jsonBuffer);

        const cleanedJsonBuffer = jsonBuffer
          .replace(/\\\"/g, '"')
          .replace(/\\n/g, "")
          .replace(/^[\s,]+/, "");

        for (let j = 0; j < cleanedJsonBuffer.length; j++) {
          yield cleanedJsonBuffer[j];
        }

        jsonBuffer = "";
      }
      buffer = "";
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

        if (char === "}" && braceCount === 0) {
          const cleanedJsonBuffer = jsonBuffer
            .replace(/\\\"/g, '"')
            .replace(/\\n/g, "")
            .replace(/^[\s,]+/, "");
          try {
            const jsonObj = JSON.parse(cleanedJsonBuffer.trim());
            yield jsonObj;
          } catch (err) {
            console.error("Failed to parse JSON:", err);
          }
          jsonBuffer = "";
        }
      }
      buffer = "";
    }
  }
}

export default processParametersFromStream;
