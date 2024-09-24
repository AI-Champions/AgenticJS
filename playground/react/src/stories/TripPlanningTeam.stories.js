import AgentsBoardDebugger from "../AgentsBoardDebugger";
import teamOpenAI from "../teams/trip_planning/openai";
import teamGemini from "../teams/trip_planning/gemini";
import "../index.css";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: "Teams/Trip Planning Team",
  component: AgentsBoardDebugger,
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const withOpenAI = {
  args: {
    team: teamOpenAI,
    title: "With OpenAI Model",
  },
};

export const withGemini = {
  args: {
    team: teamGemini,
    title: "With Gemini Model",
  },
};
