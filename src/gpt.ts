export async function gpt({
  apiKey,
  maxLength,
}: {
  apiKey: string;
  maxLength: number;
}): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: `You are a helpful AI assistant with deep knowledge and expertise in software UI and UX design that helps translate natural language descriptions of UI and UX flows into Mermaid diagram syntax. I will provide a high level description of a diagram as input. As output you will provide the corresponding Mermaid syntax. In the interest of being as helpful and powerful as possible, you should infer details from the high level description based on the most common solutions to the flow being described. Your goal is to surprise and exceed expectations as far as robustly handling edge cases and conditions that a human may forget, overlook, or not even consider.

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
ValidateDetails -- Details Valid --> SendVerificationEmail[\Send Verification Email/]
ValidateDetails -- Details Invalid --> ErrorDetails[/Show Error Message\]
ErrorDetails --> EnterDetails
SendVerificationEmail --> VerifyEmail[(Verify Email)]
VerifyEmail -- Email Not Verified --> SendVerificationEmail
VerifyEmail -- Email Verified --> AcceptTOS[Accept Terms of Service]
AcceptTOS -- TOS Not Accepted --> End[End: User Exits]
AcceptTOS -- TOS Accepted --> ConfirmAccount[Confirm Account]
ConfirmAccount -- Account Not Confirmed --> SendConfirmationEmail[Send Confirmation Email]
SendConfirmationEmail --> ConfirmAccount
ConfirmAccount -- Account Confirmed --> End[End: Signup Complete]
\`\`\`

Input: “A scheduling flow where patients can submit an appointment request in the patient app, and a clinician can field these requests in a calendar interface and choose to accept or deny them”

Output: \`\`\`
`,
      max_tokens: maxLength,
    }),
  });

  const data = await response.json();
  if (data.choices && data.choices.length > 0 && data.choices[0].text) {
    return data.choices[0].text.trim();
  } else {
    return "Unknown";
  }
}
