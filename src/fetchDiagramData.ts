import { DiagramElement } from "./types";

export const GPTModels = {
  gpt3: "gpt-3.5-turbo-0613",
  gpt4: "gpt-4-0613",
} as const;

export async function fetchDiagramData({
  licenseKey,
  model,
  input,
}: {
  licenseKey: string;
  model: keyof typeof GPTModels;
  input: string;
}): Promise<DiagramElement[]> {
  try {
    const response = await fetch(
      "https://figma-plugins-pete.vercel.app/api/diagrammaton/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          licenseKey,
          diagramDescription: input,
          model: GPTModels[model] || GPTModels["gpt3"],
        }),
      }
    );

    return response.json();
  } catch (err) {
    throw new Error("Unknown error 🫠");
  }
}
