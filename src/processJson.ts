import debug from "./debug";

const stepsBegin = '\\"steps\\": [\\n';
const messageStringBegin = '\\"message\\": \\"';
const messageStringEnd = '\\"\\n';

async function* processParametersFromStream(
  readableStream: ReadableStream<Uint8Array>
) {
  const reader = readableStream.getReader();
  let buffer = "";
  let jsonBuffer = "";
  let messageBuffer = "";
  let braceCount = 0;
  let inStepsArray = false;
  let inMessageString = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      if (debug.enabled) {
        console.log("Stream ended.");
      }
      yield null;
      break;
    }

    const chunk = new TextDecoder().decode(value);
    buffer += chunk;

    if (!inStepsArray) {
      const stepsStart = buffer.indexOf(stepsBegin);
      if (stepsStart !== -1) {
        inStepsArray = true;
        buffer = buffer.slice(stepsStart + stepsBegin.length);
      }
    }

    if (!inMessageString) {
      const messageStart = buffer.indexOf(messageStringBegin);
      if (messageStart !== -1) {
        inMessageString = true;
        buffer = buffer.slice(messageStart + messageStringBegin.length);
      }
    }

    if (inMessageString) {
      let i = 0;
      while (i < buffer.length) {
        const char = buffer[i];
        messageBuffer += char;

        if (messageBuffer.endsWith(messageStringEnd)) {
          messageBuffer = messageBuffer.slice(0, -messageStringEnd.length);
          buffer = buffer.slice(i + 1);
          inMessageString = false;
          break;
        }
        i++;
      }

      if (messageBuffer !== "") {
        yield messageBuffer;
        messageBuffer = "";
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
