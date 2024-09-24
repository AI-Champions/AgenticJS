const { Agent, Task, Team } = require("kaibanjs");
const {
  TavilySearchResults,
} = require("@langchain/community/tools/tavily_search");
const { zodToJsonSchema } = require("zod-to-json-schema");

// Define tools
const searchInternetTool = new TavilySearchResults({
  maxResults: 3,
  apiKey: "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",
});

// Define agents with exact roles, goals, and backgrounds from Python example
const citySelectorAgent = new Agent({
  name: "Peter Atlas",
  role: "City Selection Expert",
  goal: "Select the best city based on weather, season, and prices",
  background: "An expert in analyzing travel data to pick ideal destinations",
  type: "ReactChampionAgent",
  tools: [searchInternetTool],
  maxIterations: 20,
  promptTemplates: {
    SYSTEM_MESSAGE: ({ agent, task }) => {
      const prompt = `@@SYSTEM_MESSAGE@@ You are ${agent.name}.
    
    Your role is: ${agent.role}.
    Your background is: ${agent.background}.
    Your main goal is: ${agent.goal}
    You are working as part of a team.
    
    For your work you will have available:
    
    - Access to a defined set of tools. 
    - Findings and insights from previous tasks. You must use this information to complete your current task.
    - Must follow a specific format for your output.
    
    ## Tools available for your use: 
    
    ${
      agent.tools.length > 0
        ? agent.tools
            .map(
              (tool) =>
                `${tool.name}: ${
                  tool.description
                } Tool Input Schema: ${JSON.stringify(
                  zodToJsonSchema(tool.schema)
                )}`
            )
            .join(", ")
        : "No tools available. You must reply using your internal knowledge."
    }
    
    **Important:** You ONLY have access to the tools above, and should NEVER make up tools that are not listed here.
    
    ## Format of your output
    
    You will return just one of the following:
    
    - Thought + (Action or Self Question)
    OR
    - Observation
    OR
    - Final Answer
    
    Below is the explanation of each one:
    
    ### Thought + (Action or Self Question)
    
    {
       "thought": "your thoughts about what to do next" // it could be an action or ask yourself a follow up question
       "action":  "you decide what action to take based on your previous thought", // the action could be a self follow up question or decide to use a tool from the available tools to use,
       "actionInput": the input to the action, just a simple JSON object, enclosed in curly braces, using \\" to wrap keys and values. Remember to use the Tool Schema.
    }
    
    Examples: 
    
    {
       "thought": "To find out who won the Copa America in 2024, I need to search for the most recent and relevant information."
       "action": "tavily_search_results_json",
       "actionInput": {"query":"Copa America 2024 winner"}
    }
    
    other
    
    {
       "thought": "To find out who won the Copa America in 2024, I need to search for the most recent and relevant information."
       "action": "self_question",
       "actionInput": {"query":"Copa America 2024 winner"}
    }
    
    ### Observation
    
    {
       "observation":  "Reflect about the result of the action. (E.g:  I got the following results from the tool Can I get the Final Answer from there?)", 
        "isFinalAnswerReady": false // If you have the final answer or not
    }
    
    ### Final Answer
    
    IMPORTANT: (Please respect the expected output requirements from the user): ${
      task.expectedOutput
    }
    
    {
        "finalAnswer": "The final answer to the Task."
    }
    
    **IMPORTANT**: You must return a valid JSON object. As if you were returning a JSON object from a function.
    `;
      return prompt;
    },
    INITIAL_MESSAGE: ({ agent, task, context }) => {
      const prompt = `@@INSTRUCTIONS@@ Hi ${
        agent.name
      }, please complete the following task: ${task.description}. 
            Your expected output should be: "${task.expectedOutput}". 
            ${
              context
                ? `Incorporate the following findings and insights from previous tasks: "${context}"`
                : ""
            }`;
      return prompt;
    },
    INVALID_JSON_FEEDBACK: () => {
      const prompt = `@@INVALID_JSON_FEEDBACK@@ You returned an invalid JSON object. Please format your answer as a valid JSON object. Just the JSON object not comments or anything else. E.g: {"finalAnswer": "The final answer"}`;
      return prompt;
    },
    THOUGHT_WITH_SELF_QUESTION_FEEDBACK: ({ question }) => {
      const prompt = `@@THOUGHT_WITH_SELF_QUESTION_FEEDBACK@@ Awesome, please answer yourself the question: ${question}.`;
      return prompt;
    },
    THOUGHT_FEEDBACK: () => {
      const prompt = `@@THOUGHT_FEEDBACK@@ Your thoughts are great, let's keep going.`;
      return prompt;
    },
    SELF_QUESTION_FEEDBACK: () => {
      const prompt = `@@SELF_QUESTION_FEEDBACK@@ Awesome, please answer yourself the question.`;
      return prompt;
    },
    TOOL_RESULT_FEEDBACK: ({ toolResult }) => {
      const prompt = `@@TOOL_RESULT_FEEDBACK@@ You got this result from the tool: ${JSON.stringify(
        toolResult
      )}`;
      return prompt;
    },
    TOOL_ERROR_FEEDBACK: ({ toolName }) => {
      const prompt = `@@TOOL_ERROR_FEEDBACK@@ An error occurred while using the tool ${toolName}. Please try again or use a different method.`;
      return prompt;
    },
    TOOL_NOT_EXIST_FEEDBACK: ({ toolName }) => {
      const prompt = `@@TOOL_NOT_EXIST_FEEDBACK@@ Hey, the tool ${toolName} does not exist. Please find another way.`;
      return prompt;
    },
    OBSERVATION_FEEDBACK: () => {
      const prompt = `@@OBSERVATION_FEEDBACK@@ Great observation. Please keep going. Let's get to the final answer.`;
      return prompt;
    },
    WEIRD_OUTPUT_FEEDBACK: () => {
      const prompt = `@@WEIRD_OUTPUT_FEEDBACK@@ Your latest response does not match the way you are expected to output information. Please correct it.`;
      return prompt;
    },
    FORCE_FINAL_ANSWER_FEEDBACK: () => {
      const prompt = `@@FORCE_FINAL_ANSWER_FEEDBACK@@ We don't have more time to keep looking for the answer. Please use all the information you have gathered until now and give the finalAnswer right away.`;
      return prompt;
    },
    WORK_ON_FEEDBACK_FEEDBACK: ({ feedback }) => {
      const prompt = `@@WORK_ON_FEEDBACK_FEEDBACK@@ Here is some feedback for you to address: ${feedback}`;
      return prompt;
    },
  },
});

const localExpertAgent = new Agent({
  name: "Sophia Lore",
  role: "Local Expert at this city",
  goal: "Provide the BEST insights about the selected city",
  background: `A knowledgeable local guide with extensive information about the city, it's attractions and customs`,
  type: "ReactChampionAgent",
  tools: [searchInternetTool],
});

const travelConciergeAgent = new Agent({
  name: "Maxwell Journey",
  role: "Amazing Travel Concierge",
  goal: `Create the most amazing travel itineraries with budget and packing suggestions for the city`,
  background: `Specialist in travel planning and logistics with decades of experience`,
  type: "ReactChampionAgent",
  tools: [searchInternetTool],
});

// Define tasks with dynamic input placeholders
const identifyTask = new Task({
  description: `Analyze and select the best city for the trip based on 
    specific criteria such as weather patterns, seasonal events,
    and travel costs. ... 
    Origin: {origin}, City Options: {cities}, 
    Trip Date: {range}, 
    Traveler Interests: {interests}`,
  expectedOutput: `Detailed report on the chosen city,
     including flight costs, 
     weather forecast and attractions`,
  agent: citySelectorAgent,
});

const gatherTask = new Task({
  description: `Compile an in-depth guide for the selected city, 
    considering key attractions, local customs, and special events.
     ... Trip Date: {range}, Origin: {origin}, Interests: {interests}`,
  expectedOutput: `A comprehensive city guide,
     rich in cultural insights and practical tips`,
  agent: localExpertAgent,
});

const planTask = new Task({
  description: `Develop a full 7-day travel itinerary 
    with detailed daily plans, including places to eat, 
    packing suggestions, and a budget breakdown. ... 
    Trip Date: {range}, Origin: {origin}, Interests: {interests}`,
  expectedOutput: "A complete expanded travel plan formatted as markdown",
  agent: travelConciergeAgent,
});

// Team to coordinate the agents, with dynamic inputs
const team = new Team({
  name: "Trip Planning Team",
  agents: [citySelectorAgent, localExpertAgent, travelConciergeAgent],
  tasks: [identifyTask, gatherTask, planTask],
  logLevel: "error",
  inputs: {
    origin: "New York",
    cities: ["Tokyo", "Paris", "Berlin"],
    interests: "Art and Culture",
    range: "2024-12-01 to 2024-12-15",
  }, // Actual dynamic inputs
  env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY }, // Environment variables for the team,
});

module.exports = team;
