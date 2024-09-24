// Type definitions for "kaibanjs" 0.1.0
// Project: kaibanjs
// Author: @darielnoel <github.com/darielnoel>
// Definitions by: @alienkarma <github.com/alienkarma>

import { Tool } from "langchain/tools";
import type { AGENT_STATUS_enum, TASK_STATUS_enum } from "./enums.d.ts";
import type {
  BaseAgent,
  IBaseAgentParams,
  ILLMConfig,
  ITaskStats,
  TAgentTypes,
  TStore,
} from "./types.d.ts";

/**
 * ### Agent parameters
 * @interface IAgentParams
 * @extends IBaseAgentParams
 * @property {TAgentTypes} type - The type of agent.
 */
export interface IAgentParams extends IBaseAgentParams {
  type?: TAgentTypes;
}

/**
 * ### Agent
 * A class representing an agent.
 * @class
 * @extends BaseAgent
 * @property {BaseAgent} agentInstance - The agent instance.
 * @property {string} type - The type of agent.
 */
export class Agent {
  agentInstance: BaseAgent;
  type: string;

  /**
   * Creates an instance of an Agent.
   * @param {IAgentParams} config - The configuration parameters for the agent.
   */
  constructor(config: IAgentParams);

  /**
   * Creates an agent.
   * @param {TAgentTypes} type - The type of agent.
   * @param {IBaseAgentParams} config - The configuration parameters for the agent.
   * @returns {BaseAgent} The created agent instance.
   */
  createAgent(type: TAgentTypes, config: IBaseAgentParams): BaseAgent;

  /**
   * Executes a task.
   * @param {Task} task - The task to be executed.
   * @returns {Promise<string>} A promise resolving with the task result.
   */
  executeTask(task: Task): Promise<string>;

  /**
   * Sets the store.
   * @param {TStore} store - The store to be set.
   */
  setStore(store: TStore): void;

  /**
   * Sets the environment variables.
   * @param {Record<string, any>} env - The environment variables to be set.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setEnv(env: Record<string, any>): void;

  /**
   * Sets the status of the agent.
   * @param {AGENT_STATUS_enum} status - The status to be set.
   */
  setStatus(status: AGENT_STATUS_enum): void;

  /**
   * Returns the agent ID.
   * @returns {string} The agent ID.
   */
  id(): string;

  /**
   * Returns the agent name.
   * @returns {string} The agent name.
   */
  name(): string;

  /**
   * Returns the agent role.
   * @returns {string} The agent role.
   */
  role(): string;

  /**
   * Returns the agent goal.
   * @returns {string} The agent goal.
   */
  goal(): string;

  /**
   * Returns the agent background.
   * @returns {string} The agent background.
   */
  background(): string;

  /**
   * Returns the tools available to the agent.
   * @returns {Tool[]} The list of tools.
   */
  tools(): Tool[];

  /**
   * Returns the status of the agent.
   * @returns {AGENT_STATUS_enum} The agent's status.
   */
  status(): AGENT_STATUS_enum;

  /**
   * Returns the configuration for the language model.
   * @returns {ILLMConfig} The language model configuration.
   */
  llmConfig(): ILLMConfig;

  /**
   * Returns the system message for the language model.
   * @returns {string} The language model system message.
   */
  llmSystemMessage(): string;

  /**
   * Indicates whether the agent is forced to provide a final answer.
   * @returns {boolean} True if the agent is forced to give a final answer, otherwise false.
   */
  forceFinalAnswer(): boolean;
}

/**
 * ### Task parameters
 * @interface ITaskParams
 * @property {string} [title] - The title of the task.
 * @property {string} description - The description of the task.
 * @property {string} expectedOutput - The expected output of the task.
 * @property {BaseAgent} agent - The agent to execute the task.
 * @property {boolean} [isDeliverable] - Indicates whether the task is deliverable.
 */
export interface ITaskParams {
  title?: string;
  description: string;
  expectedOutput: string;
  agent: Agent;
  isDeliverable?: boolean;
}

/**
 * ### Task
 * A class representing a task.
 * @class
 * @property {string} id - The task ID.
 * @property {string} title - The task title.
 * @property {string} description - The task description.
 * @property {string} expectedOutput - The expected output of the task.
 * @property {boolean} isDeliverable - Indicates whether the task is deliverable.
 * @property {Agent} agent - The agent to execute the task.
 * @property {TASK_STATUS_enum} status - The status of the task.
 * @property {string} result - The result of the task.
 * @property {ITaskStats | null} stats - The statistics of the task.
 * @property {number | null} duration - The duration of the task.
 * @property {Task[]} dependencies - The dependencies of the task.
 * @property {string | null} interpolatedTaskDescription - The interpolated task description.
 * @property {TStore} store - The store.
 */
export class Task {
  id: string;
  title: string;
  description: string;
  expectedOutput: string;
  isDeliverable: boolean;
  agent: Agent;
  status: TASK_STATUS_enum;
  result: string;
  stats: ITaskStats | null;
  duration: number | null;
  dependencies: Task[];
  interpolatedTaskDescription: string | null;
  store: TStore;

  /**
   * Creates an instance of a Task.
   * @param {ITaskParams} params - The parameters for the task.
   */
  constructor(params: ITaskParams);

  /**
   * Executes the task.
   * @param {TStore} store - The store.
   */
  setStore(store: TStore): void;
}

/**
 * ### Team parameters
 * @interface ITeamParams
 * @property {string} name - The name of the team.
 * @property {BaseAgent[]} [agents] - The agents in the team.
 * @property {Task[]} [tasks] - The tasks for the team.
 * @property {string} [logLevel] - The log level for the team.
 * @property {Record<string, string>} [inputs] - The inputs for the team.
 * @property {Record<string, any> | null} [env] - The environment variables for the team.
 */
export interface ITeamParams {
  name: string;
  agents?: Agent[];
  tasks?: Task[];
  logLevel?: string;
  inputs?: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  env?: Record<string, any> | null;
}

/**
 * ### Team
 * A class representing a team.
 * @class
 * @property {TStore} store - The store instance.
 */
export class Team {
  store: TStore;

  /**
   * Creates an instance of a Team.
   * @param {ITeamParams} params - The parameters for the team.
   */
  constructor(params: ITeamParams);

  /**
   * Starts the team operations.
   * @returns {Promise<void>} A promise resolving when the team has started.
   */
  start(): Promise<void>;

  /**
   * Returns the store.
   * @returns {TStore} The store instance.
   */
  getStore(): TStore;

  /**
   * Returns the store instance in use.
   * @returns {TStore} The store instance.
   */
  useStore(): TStore;

  /**
   * Subscribes to changes in the team.
   * @param {(newValues: any) => void} listener - The listener function that will be called on changes.
   * @param {string[]} [properties] - The specific properties to listen to.
   * @returns {() => void} A function to unsubscribe from the changes.
   */
  subscribeToChanges(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (newValues: any) => void,
    properties?: string[]
  ): () => void;
}
