import AgentsBoardDebugger from "../AgentsBoardDebugger";
import "../index.css";
import teamOpenAI from "../teams/with_proxy/openai";
import teamAnthropic from "../teams/with_proxy/anthropic";
import teamGemini from "../teams/with_proxy/gemini";
import teamMistral from "../teams/with_proxy/mistral";
// import teamCohere from "../teams/llms/cohere";
// import teamAzureOpenAI from "../teams/llms/azure_openai";
// import teamGroq from "../teams/llms/groq";

export default {
  title: "LLMs/Using Proxy",
  component: AgentsBoardDebugger,
};

export const withOpenAI = {
  args: {
    team: teamOpenAI,
    title: "With OpenAI",
  },
};

export const withAnthropic = {
  args: {
    team: teamAnthropic,
    title: "With Anthropic",
  },
};

export const withGemini = {
  args: {
    team: teamGemini,
    title: "With Gemini",
  },
};

export const withMistral = {
  args: {
    team: teamMistral,
    title: "With Mistral",
  },
};

// export const withCohere = {
//     args: {
//         team: teamCohere,
//         title: "With Cohere",
//     },
// };

// export const withAzureOpenAI = {
//     args: {
//         team: teamAzureOpenAI,
//         title: "With Azure OpenAI",
//     },
// };

// export const withGroq = {
//     args: {
//         team: teamGroq,
//         title: "With Groq",
//     },
// };
