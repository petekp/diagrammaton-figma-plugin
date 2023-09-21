import { DiagramElement } from "./types";

type ReturnType =
  | {
      type: "message";
      data: string;
    }
  | {
      type: "steps";
      data: DiagramElement[];
    };

export type GPTModels = "gpt3" | "gpt4";

export async function fetchDiagramData({
  licenseKey,
  model,
  input,
}: {
  licenseKey: string;
  model: GPTModels;
  input: string;
}): Promise<ReturnType> {
  try {
    return {
      type: "steps",
      data: [
        {
          from: {
            id: "1",
            label: "Ancient Philosophy",
            shape: "ROUNDED_RECTANGLE",
          },
          link: { label: "Evolved into" },
          to: {
            id: "2",
            label: "Medieval Philosophy",
            shape: "ROUNDED_RECTANGLE",
          },
        },
        {
          from: {
            id: "2",
            label: "Medieval Philosophy",
            shape: "ROUNDED_RECTANGLE",
          },
          link: { label: "Evolved into" },
          to: {
            id: "3",
            label: "Renaissance Philosophy",
            shape: "ROUNDED_RECTANGLE",
          },
        },
        {
          from: {
            id: "3",
            label: "Renaissance Philosophy",
            shape: "ROUNDED_RECTANGLE",
          },
          link: { label: "Evolved into" },
          to: {
            id: "4",
            label: "Modern Philosophy",
            shape: "ROUNDED_RECTANGLE",
          },
        },
        {
          from: {
            id: "4",
            label: "Modern Philosophy",
            shape: "ROUNDED_RECTANGLE",
          },
          link: { label: "Evolved into" },
          to: {
            id: "5",
            label: "Postmodern Philosophy",
            shape: "ROUNDED_RECTANGLE",
          },
        },
        {
          from: {
            id: "5",
            label: "Postmodern Philosophy",
            shape: "ROUNDED_RECTANGLE",
          },
          link: { label: "Influences" },
          to: {
            id: "6",
            label: "Contemporary Philosophy",
            shape: "ROUNDED_RECTANGLE",
          },
        },
      ],
    };
    const response = await fetch(
      "http://localhost:3000/api/diagrammaton/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          licenseKey,
          diagramDescription: input,
          model: model || "gpt3",
        }),
      }
    );

    return response.json();
  } catch (err) {
    throw new Error("Something unexpected happened 🫠");
  }
}
