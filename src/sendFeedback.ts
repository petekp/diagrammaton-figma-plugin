export async function sendFeedback({
  message,
  licenseKey,
}: {
  message: string;
  licenseKey: string;
}) {
  try {
    console.log("feedback: ", message);
    const response = await fetch(
      "https://www.diagrammaton.com/api/diagrammaton/feedback",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          licenseKey,
        }),
      }
    );

    return response.json();
  } catch (err) {
    throw new Error("Something unexpected happened 🫠");
  }
}
