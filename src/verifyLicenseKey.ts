import { getBaseUrl } from "./util";

export async function verifyLicenseKey({ licenseKey }: { licenseKey: string }) {
  try {
    const response = await fetch(`${getBaseUrl()}/api/diagrammaton/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        licenseKey,
      }),
    });

    return response.json();
  } catch (err) {
    if (err instanceof Error) {
      return { type: "error", message: "Unable to reach server 🫠" };
    }
    throw new Error("Something unexpected happened 🫠");
  }
}
