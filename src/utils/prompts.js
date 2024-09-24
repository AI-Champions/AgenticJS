/**
 * Prompt Templates for Agents.
 *
 * This file provides templates for constructing prompts that are used to interact with language models within the KaibanJS library.
 * These templates ensure that interactions are consistent and properly formatted, facilitating effective communication with LLMs.
 *
 * Usage:
 * Utilize these templates when setting up dialogues or commands for agents to ensure they are correctly interpreted by the underlying LLMs.
 */

import { zodToJsonSchema } from "zod-to-json-schema";

/**
 * Default prompt templates for the ReactChampionAgent.
 * These prompts are used to generate appropriate messages for different scenarios during the agent's execution.
 * @typedef {Object} ReactChampionAgentPrompts
 */
const REACT_CHAMPION_AGENT_DEFAULT_PROMPTS = {
  /**
   * Generates the system message that sets up the initial context and instructions for the agent.
   * This message defines the agent's role, capabilities, and the format of its responses.
   * @param {Object} params - The parameters for generating the system message.
   * @param {Object} params.agent - The agent object containing its properties.
   * @param {Object} params.task - The task object describing the current task.
   * @returns {string} The formatted system message.
   */
  SYSTEM_MESSAGE: ({ agent, task }) => {
    const prompt = `You are ${agent.name}.

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
  /**
   * Generates the initial message that provides the task description to the agent.
   * This message kickstarts the agent's work on a specific task.
   * @param {Object} params - The parameters for generating the initial message.
   * @param {Object} params.agent - The agent object containing its properties.
   * @param {Object} params.task - The task object describing the current task.
   * @param {string} params.context - Additional context or background information for the task.
   * @returns {string} The formatted initial message.
   */
  INITIAL_MESSAGE: ({ agent, task, context }) => {
    const prompt = `Hi ${agent.name}, please complete the following task: ${
      task.description
    }. 
        Your expected output should be: "${task.expectedOutput}". 
        ${
          context
            ? `Incorporate the following findings and insights from previous tasks: "${context}"`
            : ""
        }`;
    return prompt;
  },
  /**
   * Generates feedback when the agent's response is not in valid JSON format.
   * This prompt asks the agent to correct its output format.
   * @param {Object} params - The parameters for generating the invalid JSON feedback.
   * @param {Object} params.agent - The agent object containing its properties.
   * @param {Object} params.task - The task object describing the current task.
   * @param {string} params.llmOutput - The invalid output that was received.
   * @returns {string} The formatted feedback message.
   */
  INVALID_JSON_FEEDBACK: () => {
    const prompt = `You returned an invalid JSON object. Please format your answer as a valid JSON object. Just the JSON object not comments or anything else. E.g: {"finalAnswer": "The final answer"}`;
    return prompt;
  },
  /**
   * Generates feedback for a thought that includes a self-question.
   * This prompt encourages the agent to answer its own question.
   * @param {Object} params - The parameters for generating the thought with self-question feedback.
   * @param {Object} params.agent - The agent object containing its properties.
   * @param {Object} params.task - The task object describing the current task.
   * @param {string} params.thought - The agent's thought.
   * @param {string} params.question - The self-question posed by the agent.
   * @param {string} params.parsedLLMOutput - The parsed LLM output.
   * @returns {string} The formatted feedback message.
   */
  THOUGHT_WITH_SELF_QUESTION_FEEDBACK: ({ question }) => {
    const prompt = `Awesome, please answer yourself the question: ${question}.`;
    return prompt;
  },

  /**
   * Generates feedback for a general thought from the agent.
   * This prompt encourages the agent to continue its line of thinking.
   * @param {Object} params - The parameters for generating the thought feedback.
   * @param {Object} params.agent - The agent object containing its properties.
   * @param {Object} params.task - The task object describing the current task.
   * @param {string} params.thought - The agent's thought.
   * @param {string} params.parsedLLMOutput - The parsed LLM output.
   * @returns {string} The formatted feedback message.
   */
  THOUGHT_FEEDBACK: () => {
    const prompt = `Your thoughts are great, let's keep going.`;
    return prompt;
  },
  /**
   * Generates feedback for a self-question from the agent.
   * This prompt encourages the agent to answer its own question.
   * @param {Object} params - The parameters for generating the self-question feedback.
   * @param {Object} params.agent - The agent object containing its properties.
   * @param {Object} params.task - The task object describing the current task.
   * @param {string} params.question - The self-question posed by the agent.
   * @param {string} params.parsedLLMOutput - The parsed LLM output.
   * @returns {string} The formatted feedback message.
   */
  SELF_QUESTION_FEEDBACK: () => {
    const prompt = `Awesome, please answer yourself the question.`;
    return prompt;
  },
  /**
   * Generates feedback after a tool has been used, providing the result to the agent.
   * @param {Object} params - The parameters for generating the tool result feedback.
   * @param {Object} params.agent - The agent object containing its properties.
   * @param {Object} params.task - The task object describing the current task.
   * @param {string} params.toolResult - The result returned by the tool.
   * @param {string} params.parsedLLMOutput - The parsed LLM output.
   * @returns {string} The formatted feedback message.
   */
  TOOL_RESULT_FEEDBACK: ({ toolResult }) => {
    const prompt = `You got this result from the tool: ${JSON.stringify(
      toolResult
    )}`;
    return prompt;
  },
  /**
   * Generates feedback when an error occurs while using a tool.
   * This prompt informs the agent about the error and suggests trying again or using a different method.
   * @param {Object} params - The parameters for generating the tool error feedback.
   * @param {Object} params.agent - The agent object containing its properties.
   * @param {Object} params.task - The task object describing the current task.
   * @param {string} params.toolName - The name of the tool that caused the error.
   * @param {string} params.error - The error message.
   * @param {string} params.parsedLLMOutput - The parsed LLM output.
   * @returns {string} The formatted feedback message.
   */
  TOOL_ERROR_FEEDBACK: ({ toolName }) => {
    const prompt = `An error occurred while using the tool ${toolName}. Please try again or use a different method.`;
    return prompt;
  },

  /**
   * Generates feedback when the agent tries to use a non-existent tool.
   * This prompt informs the agent that the tool doesn't exist and suggests finding another way to accomplish the task.
   * @param {Object} params - The parameters for generating the non-existent tool feedback.
   * @param {Object} params.agent - The agent object containing its properties.
   * @param {Object} params.task - The task object describing the current task.
   * @param {string} params.toolName - The name of the non-existent tool.
   * @param {string} params.parsedLLMOutput - The parsed LLM output.
   * @returns {string} The formatted feedback message.
   */
  TOOL_NOT_EXIST_FEEDBACK: ({ toolName }) => {
    const prompt = `Hey, the tool ${toolName} does not exist. Please find another way.`;
    return prompt;
  },
  /**
   * Generates feedback for an observation made by the agent.
   * This prompt encourages the agent to continue towards finding a final answer.
   * @param {Object} params - The parameters for generating the observation feedback.
   * @param {Object} params.agent - The agent object containing its properties.
   * @param {Object} params.task - The task object describing the current task.
   * @param {string} params.parsedLLMOutput - The parsed LLM output.
   * @returns {string} The formatted feedback message.
   */
  OBSERVATION_FEEDBACK: () => {
    const prompt = `Great observation. Please keep going. Let's get to the final answer.`;
    return prompt;
  },

  /**
   * Generates feedback when the agent's output doesn't match the expected format.
   * This Agent uses a JSON format to return its output and sometimes it returns a non-JSON output.
   * This prompt asks the agent to correct its output.
   * @param {Object} params - The parameters for generating the unexpected output feedback.
   * @param {Object} params.agent - The agent object containing its properties.
   * @param {Object} params.task - The task object describing the current task.
   * @param {string} params.output - The unexpected output from the agent.
   * @returns {string} The formatted feedback message.
   */
  WEIRD_OUTPUT_FEEDBACK: () => {
    const prompt = `Your latest response does not match the way you are expected to output information. Please correct it.`;
    return prompt;
  },

  /**
   * Forces the agent to return the final answer.
   * Sometimes the agent's have enough information to answer the question but it keeps asking itself questions and not answering.
   * This prompt forces the agent to return the final answer with the information it has gathered until now.
   * @param {Object} params - The parameters for generating the unexpected output feedback.
   * @param {Object} params.agent - The agent object containing its properties.
   * @param {Object} params.task - The task object describing the current task.
   * @param {number} params.iterations - The number of iterations the agent has gone through.
   * @param {number} params.maxAgentIterations - The maximum number of iterations the agent is allowed to go through.
   * @returns {string} The formatted feedback message.
   */
  FORCE_FINAL_ANSWER_FEEDBACK: () => {
    const prompt = `We don't have more time to keep looking for the answer. Please use all the information you have gathered until now and give the finalAnswer right away.`;
    return prompt;
  },

  /**
   * Provides feedback to the agent based on the feedback received.
   * This prompt allows the agent to address any issues or concerns raised in the feedback.
   * FEEDBACK_FEEDBACK -> It's like inception, but with less Leonardo DiCaprio :D
   * @param {Object} params - The parameters for generating the feedback.
   * @param {Object} params.agent - The agent object containing its properties.
   * @param {Object} params.task - The task object describing the current task.
   * @param {string} params.feedback - The feedback received from the previous agent.
   * @returns {string} The formatted feedback message.
   */
  WORK_ON_FEEDBACK_FEEDBACK: ({ feedback }) => {
    const prompt = `Here is some feedback for you to address: ${feedback}`;
    return prompt;
  },
};

export { REACT_CHAMPION_AGENT_DEFAULT_PROMPTS };
