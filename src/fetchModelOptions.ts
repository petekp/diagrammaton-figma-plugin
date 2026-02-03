import { getBaseUrl } from "./util";

export type ModelOption = {
  id: string;
  label: string;
  provider: "openai" | "anthropic";
  baseModel: string;
  variant: "fast" | "thinking";
};

export type ModelListResponse = {
  defaultModelId: string | null;
  models: ModelOption[];
  providers: { openai: boolean; anthropic: boolean };
};

const modelsUrl = `${getBaseUrl()}/api/models`;

export async function fetchModelOptions(
  licenseKey: string
): Promise<ModelListResponse> {
  const response = await fetch(modelsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ licenseKey }),
  });

  if (!response.ok) {
    throw new Error("Unable to fetch models");
  }

  return response.json();
}
