export async function verifyLicenseKey({ licenseKey }: { licenseKey: string }) {
  try {
    const response = await fetch(
      "http://localhost:3000/api/diagrammaton/verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          licenseKey,
        }),
      }
    );

    return response.json();
  } catch (err) {
    throw new Error("Something unexpected happened 🫠");
  }
}
