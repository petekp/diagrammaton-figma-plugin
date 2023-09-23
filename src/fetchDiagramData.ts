import { DiagramElement } from "./types";

const debugValue: ReturnType = {
  type: "steps",
  data: [
    {
      from: { id: "start", label: "Start", shape: "ROUNDED_RECTANGLE" },
      link: {
        label: "User clicks on sign up",
        fromMagnet: "BOTTOM",
        toMagnet: "TOP",
      },
      to: { id: "sign_up", label: "Sign Up", shape: "ROUNDED_RECTANGLE" },
    },
    {
      from: { id: "sign_up", label: "Sign Up", shape: "ROUNDED_RECTANGLE" },
      link: {
        label: "User enters email and password",
        fromMagnet: "BOTTOM",
        toMagnet: "TOP",
      },
      to: {
        id: "email_verification",
        label: "Email Verification",
        shape: "ROUNDED_RECTANGLE",
      },
    },
    {
      from: {
        id: "email_verification",
        label: "Email Verification",
        shape: "ROUNDED_RECTANGLE",
      },
      link: {
        label: "User receives verification email",
        fromMagnet: "BOTTOM",
        toMagnet: "TOP",
      },
      to: {
        id: "check_email",
        label: "Check Email",
        shape: "ROUNDED_RECTANGLE",
      },
    },
    {
      from: {
        id: "check_email",
        label: "Check Email",
        shape: "ROUNDED_RECTANGLE",
      },
      link: {
        label: "User clicks on verification link",
        fromMagnet: "BOTTOM",
        toMagnet: "TOP",
      },
      to: {
        id: "verify_email",
        label: "Verify Email",
        shape: "ROUNDED_RECTANGLE",
      },
    },
    {
      from: {
        id: "verify_email",
        label: "Verify Email",
        shape: "ROUNDED_RECTANGLE",
      },
      link: {
        label: "Email is verified",
        fromMagnet: "BOTTOM",
        toMagnet: "TOP",
      },
      to: {
        id: "complete_onboarding",
        label: "Complete Onboarding",
        shape: "ROUNDED_RECTANGLE",
      },
    },
    {
      from: {
        id: "check_email",
        label: "Check Email",
        shape: "ROUNDED_RECTANGLE",
      },
      link: {
        label: "Email is not received",
        fromMagnet: "RIGHT",
        toMagnet: "RIGHT",
      },
      to: {
        id: "resend_email",
        label: "Resend Email",
        shape: "ROUNDED_RECTANGLE",
      },
    },
    {
      from: {
        id: "resend_email",
        label: "Resend Email",
        shape: "ROUNDED_RECTANGLE",
      },
      link: {
        label: "User receives new verification email",
        fromMagnet: "BOTTOM",
        toMagnet: "TOP",
      },
      to: {
        id: "check_email",
        label: "Check Email",
        shape: "ROUNDED_RECTANGLE",
      },
    },
    {
      from: {
        id: "verify_email",
        label: "Verify Email",
        shape: "ROUNDED_RECTANGLE",
      },
      link: {
        label: "Email is not verified",
        fromMagnet: "RIGHT",
        toMagnet: "RIGHT",
      },
      to: {
        id: "resend_verification",
        label: "Resend Verification",
        shape: "ROUNDED_RECTANGLE",
      },
    },
    {
      from: {
        id: "resend_verification",
        label: "Resend Verification",
        shape: "ROUNDED_RECTANGLE",
      },
      link: {
        label: "User receives new verification email",
        fromMagnet: "BOTTOM",
        toMagnet: "TOP",
      },
      to: {
        id: "verify_email",
        label: "Verify Email",
        shape: "ROUNDED_RECTANGLE",
      },
    },
    {
      from: {
        id: "complete_onboarding",
        label: "Complete Onboarding",
        shape: "ROUNDED_RECTANGLE",
      },
      link: {
        label: "User is successfully onboarded",
        fromMagnet: "BOTTOM",
        toMagnet: "TOP",
      },
      to: { id: "end", label: "End", shape: "ROUNDED_RECTANGLE" },
    },
    {
      from: {
        id: "check_email",
        label: "Check Email",
        shape: "ROUNDED_RECTANGLE",
      },
      link: {
        label: "User gives up",
        fromMagnet: "BOTTOM",
        toMagnet: "BOTTOM",
      },
      to: { id: "end", label: "End", shape: "ROUNDED_RECTANGLE" },
    },
    {
      from: {
        id: "verify_email",
        label: "Verify Email",
        shape: "ROUNDED_RECTANGLE",
      },
      link: {
        label: "User gives up",
        fromMagnet: "BOTTOM",
        toMagnet: "BOTTOM",
      },
      to: { id: "end", label: "End", shape: "ROUNDED_RECTANGLE" },
    },
    {
      from: {
        id: "resend_email",
        label: "Resend Email",
        shape: "ROUNDED_RECTANGLE",
      },
      link: {
        label: "User gives up",
        fromMagnet: "BOTTOM",
        toMagnet: "BOTTOM",
      },
      to: { id: "end", label: "End", shape: "ROUNDED_RECTANGLE" },
    },
    {
      from: {
        id: "resend_verification",
        label: "Resend Verification",
        shape: "ROUNDED_RECTANGLE",
      },
      link: {
        label: "User gives up",
        fromMagnet: "BOTTOM",
        toMagnet: "BOTTOM",
      },
      to: { id: "end", label: "End", shape: "ROUNDED_RECTANGLE" },
    },
  ],
};

type ReturnType =
  | {
      type: "message";
      data: string;
    }
  | {
      type: "steps";
      data: DiagramElement[];
    }
  | {
      type: "error";
      data: string;
    };

export type GPTModels = "gpt3" | "gpt4";

export async function fetchDiagramData({
  licenseKey,
  model,
  input,
  debug,
}: {
  licenseKey: string;
  model: GPTModels;
  input: string;
  debug: boolean;
}): Promise<ReturnType> {
  try {
    console.log("debug: ", debug);
    if (debug) {
      return debugValue;
    }

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
          model,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return { type: "error", data: errorData.message };
    }

    console.log({ response });

    return response.json();
  } catch (err) {
    throw new Error("Something unexpected happened 🫠");
  }
}
