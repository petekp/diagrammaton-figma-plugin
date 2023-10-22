import processStepsFromStream from "./processJson";
import { DiagramElement } from "./types";
import { getBaseUrl } from "./util";
import debug from "./debug";

const debugValue: DiagramElement[] = [
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
];

export type GPTModels = "gpt3" | "gpt4";

type MessageElement = {
  type: "message";
  data: string;
};

type NodeElement = {
  type: "node";
  data: DiagramElement[];
};

type EndElement = {
  type: "end";
};

type ErrorElement = {
  type: "error";
  data: string;
};

export type StreamElement =
  | MessageElement
  | NodeElement
  | EndElement
  | ErrorElement;

const streamingUrl = `${getBaseUrl()}/api/gptStreaming`;

async function fetchDiagramData({
  action,
  data,
  signal,
}: {
  action: string;
  data: any;
  signal: AbortSignal;
}): Promise<Response> {
  return fetch(streamingUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal,
    body: JSON.stringify({
      action,
      data,
    }),
  });
}

async function* processResponse(
  response: Response
): AsyncGenerator<StreamElement> {
  if (!response.ok) {
    if (response.statusText) {
      yield { type: "error", data: response.statusText };
    }

    yield { type: "error", data: "Something unfortunate happened 😢" };
  }

  if (response.body) {
    try {
      for await (const output of processStepsFromStream(response.body)) {
        if (typeof output === null) {
          yield { type: "end" };
          break;
        }

        if (typeof output === "string") {
          yield { type: "message", data: output };
          continue;
        }

        if (typeof output === "object") {
          yield { type: "node", data: output };
          continue;
        }

        yield output;
      }
    } catch (err) {
      throw new Error(`Error processing stream: ${err}`);
    }
  } else {
    throw new Error("No response body");
  }
}

export async function* fetchStream({
  signal,
  action,
  data,
}: {
  signal: AbortSignal;
  action: string;
  data: {
    diagramDescription?: string;
    instructions?: string;
    licenseKey: string;
    model: GPTModels;
  };
}): AsyncGenerator<StreamElement> {
  if (debug.enabled && debug.stubDiagram) {
    for (const debugData of debugValue) {
      yield { type: "node", data: [debugData] };
    }
    yield { type: "end" };
  }

  try {
    const response = await fetchDiagramData({
      action,
      data,
      signal,
    });

    if (debug.enabled) {
      console.info("Processing stream...");
    }
    yield* processResponse(response);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return;
    }

    if (err instanceof Error && err.message) {
      yield { type: "error", data: `Server error: ${err.message}` };
    }

    console.error(err);
  }
}
