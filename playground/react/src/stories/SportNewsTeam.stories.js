import AgentsBoardDebugger from "../AgentsBoardDebugger";
import teamOpenAI from "../teams/sport_news/openai";
import teamAnthropic from "../teams/sport_news/anthropic";
import teamGemini from "../teams/sport_news/gemini";
import teamMistral from "../teams/sport_news/mistral";

import "../index.css";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: "Teams/Sports News Team",
  component: AgentsBoardDebugger,
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const withOpenAI = {
  args: {
    team: teamOpenAI,
    title: "With OpenAI Model",
  },
};

export const withAnthropic = {
  args: {
    team: teamAnthropic,
    title: "With Anthropic Model",
  },
};

export const withGeminiAI = {
  args: {
    team: teamGemini,
    title: "With Gemini Model",
  },
};

export const withMistral = {
  args: {
    team: teamMistral,
    title: "With Mistral Model",
  },
};
