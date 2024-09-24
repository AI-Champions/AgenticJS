import AgentsBoardDebugger from "../AgentsBoardDebugger";
import teamOpenAI from "../teams/resume_creation/openai";
import teamOpenAICustomPrompts from "../teams/resume_creation/openai_custom_prompts";
import teamOpenAIHITL from "../teams/resume_creation/openai_with_hitl";
import teamOpenAIReasoningModels from "../teams/resume_creation/openai_reasoning_models";
import "../index.css";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: "Teams/Resume Creation Team",
  component: AgentsBoardDebugger,
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const withOpenAI = {
  args: {
    team: teamOpenAI,
    title: "With OpenAI Model",
  },
};

export const withHITLOpenAI = {
  args: {
    team: teamOpenAIHITL,
    title: "With HITL and OpenAI Model",
  },
};

export const withCustomPromptsOpenAI = {
  args: {
    team: teamOpenAICustomPrompts,
    title: "With Custom Prompts and OpenAI Model",
  },
};

export const withReasoningModelsOpenAI = {
  args: {
    team: teamOpenAIReasoningModels,
    title: "With OpenAI Reasoning Models",
  },
};
