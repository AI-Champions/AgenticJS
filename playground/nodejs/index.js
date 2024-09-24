// Assuming kaibanjs is a local module or a placeholder for demonstration purposes
import { Agent, Task, Team } from "kaibanjs";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

async function main() {
  // ╔══════════════════════════════════════════════════════╗
  // ║ How to Use KaibanJS:                                ║
  // ║ 1. Define your Agents with specific roles and goals  ║
  // ║ 2. Define the Tasks each Agent will perform          ║
  // ║ 3. Create the Team and assign Agents and their Tasks ║
  // ║ 4. Start the Team to execute the defined tasks       ║
  // ╚══════════════════════════════════════════════════════╝

  // ──── Agents ────────────────────────────────────────────
  // ─ Agents are autonomous entities designed to perform
  // ─ specific roles and achieve goals based on the
  // ─ tasks assigned to them.
  // ────────────────────────────────────────────────────────

  const profileAnalyst = new Agent({
    name: "Ivy",
    role: "Profile Analyst",
    goal: "Extract structured information from conversational user input.",
    background: "Data Processor",
    tools: [], // Tools are omitted for now
  });

  const formatter = new Agent({
    name: "Formy",
    role: "Formatter",
    goal: "Format structured information into a professional resume.",
    background: "Document Formatter",
    tools: [],
  });

  const reviewer = new Agent({
    name: "Revy",
    role: "Reviewer",
    goal: "Review and polish the final resume.",
    background: "Quality Assurance Specialist",
    tools: [],
  });

  // ──── Tasks ─────────────────────────────────────────────
  // ─ Tasks define the specific actions each agent must
  // ─ take, their expected outputs, and mark critical
  // ─ outputs as deliverables if they are the final
  // ─ products.
  // ────────────────────────────────────────────────────────

  const processingTask = new Task({
    title: "Process User Input",
    description: `Extract relevant details such as name, experience, skills, and job history from the user's 'aboutMe' input. 
    aboutMe: {aboutMe}`,
    expectedOutput: "Structured data ready for formatting.",
    agent: profileAnalyst,
  });

  const formattingTask = new Task({
    title: "Format Resume",
    description: `Use the extracted information to create a clean, professional resume layout tailored for a JavaScript Developer.`,
    expectedOutput: "A well-formatted resume in PDF format.",
    agent: formatter,
  });

  const reviewTask = new Task({
    title: "Review Resume",
    description: `Ensure the resume is error-free, engaging, and meets professional standards.`,
    expectedOutput:
      "A polished, final resume ready for job applications. Please do not give any feedback on the resume. Just the final resume.",
    agent: reviewer,
  });

  // ──── Team ────────────────────────────────────────────
  // ─ The Team coordinates the agents and their tasks.
  // ─ It starts with an initial input and manages the
  // ─ flow of information between tasks.
  // ──────────────────────────────────────────────────────

  const team = new Team({
    name: "Resume Creation Team",
    agents: [profileAnalyst, formatter, reviewer],
    tasks: [processingTask, formattingTask, reviewTask],
    inputs: {
      aboutMe:
        "My name is Will, I have been a Javascript Developer for 3 years. I know React, NextJS, and REDUX. My latest job was as a Junior Developer at Disney creating UIs for the main landing page.",
    }, // Initial input for the first task
    env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY },
  });

  // ──── Listening to Changes────────────────────────────────────────────
  //
  // Listening to changes in the team's state is crucial for dynamic updates.
  // Yup...KaibanJS utilizes a store similar to Redux for state management.
  //
  // You can subscribe to specific fields or any field on the store.
  //──────────────────────────────────────────────────────────────────────

  const _unsubscribe = team.subscribeToChanges(
    (updatedFields) => {
      console.log("Workflow Status Updated:", updatedFields);
    },
    ["teamWorkflowStatus"]
  );

  // ──── Start Team Workflow ───────────────────────────────────────
  //
  // Begins the predefined team process, producing the final result.
  //─────────────────────────────────────────────────────────────────
  const result = await team.start();
  console.log("Final Output:", result);
}

main();
