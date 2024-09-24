import { Agent, Task, Team } from "kaibanjs";

// Define agents
const researcher = new Agent({
  name: "Alice",
  role: "Researcher",
  goal: "Analyze AI advancements about {topic}",
  background: "AI researcher",
  tools: [],
});

const writer = new Agent({
  name: "Bob",
  role: "Writer",
  goal: "Write an article about {topic}",
  background: "Tech writer",
  tools: [],
});

// Define tasks
const researchTask = new Task({
  description: ` Identify the next big trend in {topic}.
    Focus on identifying pros and cons and the overall narrative.
    Your final report should clearly articulate the key points,
    its market opportunities, and potential risks.
    `,
  expectedOutput: "One sentence with the name of the AI trend",
  // expectedOutput: 'A comprehensive 3 paragraphs long report on the latest AI trends.',
  agent: researcher,
});

const writingTask = new Task({
  description: `Compose an insightful article on {topic}.
      Focus on the latest trends and how it's impacting the industry.
      This article should be easy to understand, engaging, and positive.`,
  // expectedOutput: 'A 1 paragraph article on {topic} advancements formatted as markdown.',
  expectedOutput:
    "A 3 paragraph article on {topic} advancements formatted as markdown.",
  agent: writer,
});

// Create a team
const team = new Team({
  name: "Research Team",
  agents: [researcher, writer],
  tasks: [researchTask, writingTask],
  inputs: { topic: "AI Agents" }, // Initial input for the first task
});

export default team;
