import { removeStringsFromArray } from "./util/index";
const GPT3 = "gpt-3.5-turbo-0613";
// const GPT4 = "gpt-4-0613";

export const GPTModels = {
  gpt3: "gpt-3.5-turbo-0613",
  gpt4: "gpt-4-0613",
} as const;

const functions = [
  {
    name: "create_diagram",
    description: "Creates a diagram using Mermaid syntax",
    parameters: {
      type: "object",
      properties: {
        steps: {
          type: "array",
          items: {
            type: "string",
          },
          description: "An array of diagram steps in Mermaid syntax",
        },
      },
    },
    required: ["steps"],
  },
];

const createMessages = (input: string) => [
  {
    role: "system",
    content: `You are a helpful AI assistant with deep knowledge and expertise in software UI and UX design that helps translate natural language descriptions of UI and UX flows into Mermaid diagram syntax. As input, I will provide a high level description of a diagram. As output, provide the corresponding Mermaid syntax, keeping the following factors in mind:

            - Make extra sure to check that the mermaid syntax you're providing is valid and free of erroneous characters that might not parse cleanly.
            - If I don't provide enough detail or context to reliably provide Mermaid syntax, you should respond with a message that includes the token [MORE DETAIL NEEDED] to indicate that you need more information from me.
            - Make sure to use concise (but grammatically correct) NodeLink labels to ensure the diagram is neat and tidy.
            - When I provide a high level diagram description, infer additional details based on the most use cases related to the general flow being described.
            - One of your primary goals is to surprise and exceed my expectations in robustly handling edge cases and conditions that I may forget, overlook, or not even consider!`,
  },
  {
    role: "user",
    content: `
        Before we begin, here are two examples of the input and output we expect:

[Example 1]

Description: “a user flow in a fitness app where the user chooses between a workout or a meditation session.”

Mermaid syntax:

\`\`\`
B --> C{First Time User?}
C -- Yes --> D[Show Onboarding]
C -- No --> E[Choose Activity]
D --> E
E --> F{Workout?}
F -- Yes --> G[Select Workout Type]
F -- No --> H[Select Meditation Type]
G --> I{Workout Type Exists?}
H --> J{Meditation Type Exists?}
I -- Yes --> K[\Start Workout/]
I -- No --> L[Show Error: "Workout Type Not Found"]
J -- Yes --> M[(Start Meditation)]
J -- No --> N[Show Error: "Meditation Type Not Found"]
K --> O[/End Workout/]
M --> P[\End Meditation\]
\`\`\`

[Example 2]

Description: “A sign up flow”

Mermaid syntax:

\`\`\`
Start((Start)) --> EnterDetails(Enter User Details)
EnterDetails --> ValidateDetails[Validate Details]
ValidateDetails -- Valid --> SendVerificationEmail[\Send Verification Email/]
ValidateDetails -- Invalid --> ErrorDetails[/Show Error Message\]
ErrorDetails --> EnterDetails
SendVerificationEmail --> VerifyEmail[(Verify Email)]
VerifyEmail -- Not Verified --> SendVerificationEmail
VerifyEmail -- Verified --> AcceptTOS[Accept Terms of Service]
AcceptTOS -- Not Accepted --> End[End: User Exits]
AcceptTOS -- Accepted --> ConfirmAccount[Confirm Account]
ConfirmAccount -- Not Confirmed --> SendConfirmationEmail[Send Confirmation Email]
SendConfirmationEmail --> ConfirmAccount
ConfirmAccount -- Confirmed --> End[End: Signup Complete]
\`\`\`

Input: ${input}

Output:`,
  },
];

export async function gpt({
  input,
  apiKey,
  model,
  maxLength = 1000,
}: {
  input: string;
  apiKey?: string;
  model: keyof typeof GPTModels;
  maxLength?: number;
}): Promise<string> {
  console.log("using model: ", model);
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GPTModels[model] || GPTModels["gpt3"],
      functions,
      function_call: {
        name: "create_diagram",
      },
      temperature: 1,
      messages: createMessages(input),
      max_tokens: maxLength,
    }),
  });

  const { choices } = await response.json();
  if (choices && choices.length > 0) {
    const { steps } = JSON.parse(choices[0].message.function_call.arguments);
    const combinedSteps = steps.reduce(
      (acc: string, curr: string[]) => acc.concat(`${curr}\n`),
      ``
    );
    const parsed = removeStringsFromArray(combinedSteps, ["```"]);
    return parsed;
  } else {
    return "Unknown";
  }
}
