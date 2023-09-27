import { getBaseUrl } from "./util";

export async function sendFeedback({
  message,
  licenseKey,
}: {
  message: string;
  licenseKey: string;
}) {
  try {
    const response = await fetch(`${getBaseUrl()}/api/diagrammaton/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        licenseKey,
      }),
    });

    return response.json();
  } catch (err) {
    throw new Error("Something unexpected happened 🫠");
  }
}
