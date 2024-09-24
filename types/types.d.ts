import { Tool } from "langchain/tools";
import type { AGENT_STATUS_enum } from "./enums.d.ts";

/**
 * ### Store types
 * @typedef {any} TStore
 * @todo Implement various stores later on.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TStore = any;

/**
 * ### Agent types
 * @typedef {"ReactChampionAgent"} TAgentTypes
 */
export type TAgentTypes = "ReactChampionAgent";

/**
 * ### BaseAgent params
 * @interface IBaseAgentParams
 * @property {string} name - The name of the agent.
 * @property {string} role - The role of the agent.
 * @property {string} goal - The goal of the agent.
 * @property {string} background - The background of the agent.
 * @property {Tool[]} [tools] - The tools available to the agent.
 * @property {ILLMConfig} [llmConfig] - The language model configuration.
 * @property {number} [maxIterations] - The maximum number of iterations.
 * @property {boolean} [forceFinalAnswer] - Whether to force the final answer.
 */
export interface IBaseAgentParams {
  name: string;
  role: string;
  goal: string;
  background: string;
  tools?: Tool[];
  llmConfig?: ILLMConfig;
  maxIterations?: number;
  forceFinalAnswer?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  llmInstance?: any;
}

/**
 * ### BaseAgent
 * Used to reference the core BaseAgent class type.
 * @class
 * @property {string} id - The agent's unique identifier.
 * @property {TStore} store - The store used by the agent.
 * @property {AGENT_STATUS_enum} status - The agent's current status.
 * @property {Record<string, any> | null} env - The agent's environment variables.
 * @property {string} llmSystemMessage - The agent's system message.
 * @property {string} name - The agent's name.
 * @property {string} role - The agent's role.
 * @property {string} goal - The agent's goal.
 * @property {string} background - The agent's background.
 * @property {Tool[]} tools - The tools available to the agent.
 * @property {ILLMConfig} llmConfig - The language model configuration.
 * @property {number} maxIterations - The maximum number of iterations.
 * @property {boolean} forceFinalAnswer - Whether to force the final answer.
 */
export declare class BaseAgent {
  id: string;
  store: TStore;
  status: AGENT_STATUS_enum;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  env: Record<string, any> | null;
  llmSystemMessage: string;

  name: string;
  role: string;
  goal: string;
  background: string;
  tools: Tool[];
  llmConfig: ILLMConfig;
  maxIterations: number;
  forceFinalAnswer: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  llmInstance: any;

  /**
   * Creates an instance of BaseAgent.
   * @param {IBaseAgentParams} params - The agent's parameters.
   */
  constructor(params: IBaseAgentParams);

  /**
   * Sets the store.
   * @param {TStore} store - The store to be set.
   */
  setStore(store: TStore): void;

  /**
   * Sets the status of the agent.
   * @param {AGENT_STATUS_enum} status - The status to be set.
   */
  setStatus(status: AGENT_STATUS_enum): void;

  /**
   * Sets the environment variables.
   * @param {Record<string, any>} env - The environment variables to be set.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setEnv(env: Record<string, any>): void;
}

/**
 * ### Various api keys
 * @interface IApiKeys
 * @property {string} [openai] - The OpenAI API key.
 * @property {string} [google] - The Google API key.
 * @property {string} [anthropic] - The Anthropic API key.
 * @property {string} [mistral] - The Mistral API key.
 */
export interface IApiKeys {
  openai?: string;
  google?: string;
  anthropic?: string;
  mistral?: string;
}

/**
 * ### LLM configuration
 * @interface ILLMConfig
 * @property {("openai" | "google" | "anthropic" | "mistral")} provider - The provider of the language model.
 * @property {string} model - The model to be used.
 * @property {number} maxRetries - The maximum number of retries.
 * @property {IApiKeys} [apiKey] - The API key for the provider.
 */
export interface ILLMConfig {
  provider: "openai" | "google" | "anthropic" | "mistral";
  model: string;
  maxRetries: number;
  apiKey?: IApiKeys;
}

/**
 * ### LLM usage stats
 * @interface ILLMUsageStats
 * @property {number} inputTokens - The number of input tokens.
 * @property {number} outputTokens - The number of output tokens.
 * @property {number} callsCount - The number of calls.
 * @property {number} callsErrorCount - The number of calls with errors.
 * @property {number} parsingErrors - The number of parsing errors.
 */
export interface ILLMUsageStats {
  inputTokens: number;
  outputTokens: number;
  callsCount: number;
  callsErrorCount: number;
  parsingErrors: number;
}

/**
 * ### Task stats
 * @interface ITaskStats
 * @property {number} startTime - The start time of the task.
 * @property {number} endTime - The end time of the task.
 * @property {number} duration - The duration of the task.
 * @property {ILLMUsageStats} llmUsageStats - The LLM usage statistics.
 * @property {number} iterationCount - The iteration count.
 */
export interface ITaskStats {
  startTime: number;
  endTime: number;
  duration: number;
  llmUsageStats: ILLMUsageStats;
  iterationCount: number;
}
