/**
 * API module for the Library.
 *
 * This module defines the primary classes used throughout the library, encapsulating
 * the core functionalities of agents, tasks, and team coordination. It serves as the
 * public interface for the library, allowing external applications to interact with
 * and utilize the main features provided.
 *
 * Classes:
 * - Agent: Represents an entity capable of performing tasks using specific AI models.
 *   Agents have properties such as name, role, and the tools they use, and are capable
 *   of executing tasks based on these properties.
 * - Task: Defines a specific activity or job that an agent can perform. Tasks are
 *   characterized by descriptions, expected outcomes, and their deliverability status.
 * - Team: Manages a group of agents and orchestrates the execution of tasks. It is
 *   responsible for coordinating the agents to achieve collective goals effectively.
 */

import { v4 as uuidv4 } from "uuid";
import { createTeamStore } from "./stores";
import { ReactChampionAgent } from "./agents";
import { TASK_STATUS_enum, WORKFLOW_STATUS_enum } from "./utils/enums";

class Agent {
  constructor({ type, ...config }) {
    this.agentInstance = this.createAgent(type, config);
    this.type = type || "ReactChampionAgent";
  }

  createAgent(type, config) {
    switch (type) {
      case "ReactChampionAgent":
        return new ReactChampionAgent(config);
      default:
        return new ReactChampionAgent(config);
    }
  }

  workOnTask(task, inputs, context) {
    return this.agentInstance.workOnTask(task, inputs, context);
  }

  workOnFeedback(task, inputs, context) {
    return this.agentInstance.workOnFeedback(task, inputs, context);
  }

  setStatus(status) {
    this.agentInstance.setStatus(status);
  }

  initialize(store, env) {
    this.agentInstance.initialize(store, env);
  }

  // Proxy property access to the underlying agent instance
  get id() {
    return this.agentInstance.id;
  }

  get name() {
    return this.agentInstance.name;
  }

  get role() {
    return this.agentInstance.role;
  }

  get goal() {
    return this.agentInstance.goal;
  }

  get background() {
    return this.agentInstance.background;
  }

  get tools() {
    return this.agentInstance.tools;
  }
  get status() {
    return this.agentInstance.status;
  }

  get llmConfig() {
    return this.agentInstance.llmConfig;
  }
  get llmSystemMessage() {
    return this.agentInstance.llmSystemMessage;
  }
  get forceFinalAnswer() {
    return this.agentInstance.forceFinalAnswer;
  }
  get promptTemplates() {
    return this.agentInstance.promptTemplates;
  }
}
class Task {
  constructor({
    title = "",
    description,
    expectedOutput,
    agent,
    isDeliverable = false,
    externalValidationRequired = false,
  }) {
    this.id = uuidv4();
    this.title = title; // Title is now optional with a default empty string
    this.description = description;
    this.expectedOutput = expectedOutput;
    this.isDeliverable = isDeliverable;
    this.agent = agent;
    this.status = TASK_STATUS_enum.TODO;
    this.result = null;
    this.stats = null;
    this.duration = null;
    this.dependencies = [];
    this.interpolatedTaskDescription = null;
    this.feedbackHistory = []; // Initialize feedbackHistory as an empty array
    this.externalValidationRequired = externalValidationRequired;
  }

  setStore(store) {
    this.store = store;
  }
}

/**
 * Represents a team of AI agents working on a set of tasks.
 * This class provides methods to control the workflow, interact with tasks,
 * and observe the state of the team's operations.
 */
class Team {
  /**
   * Creates a new Team instance.
   *
   * @param {Object} config - The configuration object for the team.
   * @param {string} config.name - The name of the team.
   * @param {Array} config.agents - The list of agents in the team.
   * @param {Array} config.tasks - The list of tasks for the team to work on.
   * @param {string} config.logLevel - The logging level for the team's operations.
   * @param {Object} config.inputs - Initial inputs for the team's tasks.
   * @param {Object} config.env - Environment variables for the team.
   */
  constructor({ name, agents, tasks, logLevel, inputs = {}, env = null }) {
    this.store = createTeamStore({
      name,
      agents: [],
      tasks: [],
      inputs,
      env,
      logLevel,
    });

    // Add agents and tasks to the store, they will be set with the store automatically
    this.store.getState().addAgents(agents);
    this.store.getState().addTasks(tasks);
  }

  /**
   * Starts the team's workflow.
   * This method initiates the process of agents working on tasks.
   *
   * @param {Object} inputs - Optional inputs to override or supplement the initial inputs.
   * @returns {void}
   */
  async start(inputs = null) {
    return new Promise((resolve, reject) => {
      const unsubscribe = this.store.subscribe(
        (state) => state.teamWorkflowStatus,
        (status) => {
          const state = this.store.getState();
          switch (status) {
            case WORKFLOW_STATUS_enum.FINISHED:
              unsubscribe();
              resolve({
                status,
                result: state.workflowResult,
                stats: this.getWorkflowStats(),
              });
              break;
            case WORKFLOW_STATUS_enum.ERRORED:
              unsubscribe();
              reject(new Error("Workflow encountered an error"));
              break;
            case WORKFLOW_STATUS_enum.BLOCKED:
              unsubscribe();
              resolve({
                status,
                result: null,
                stats: this.getWorkflowStats(),
              });
              break;
            default:
              // For other statuses (like RUNNING), we don't resolve yet
              break;
          }
        }
      );

      try {
        // Trigger the workflow
        this.store.getState().startWorkflow(inputs);
      } catch (error) {
        // If an error occurs during the workflow execution, reject the promise
        reject(error);
        // Unsubscribe to prevent memory leaks in case of an error
        unsubscribe();
      }
    });
  }

  /**
   * Provides direct access to the underlying store.
   * This method is intended for advanced users who need more control over the state.
   * More DX friendly for NodeJS Developers
   *
   * @returns {Object} The store object.
   */
  getStore() {
    return this.store;
  }

  /**
   * Provides direct access to the underlying store.
   * This method is intended for advanced users who need more control over the state.
   * More DX friendly for React Developers
   *
   * @returns {Object} The store object.
   */
  useStore() {
    return this.store;
  }

  // Enhanced subscribeToChanges to listen for specific properties
  subscribeToChanges(listener, properties = []) {
    if (properties.length === 0) {
      // No specific properties, return global subscription
      return this.store.subscribe(listener);
    }

    let currentValues = properties.reduce(
      (acc, prop) => ({
        ...acc,
        [prop]: this.store.getState()[prop],
      }),
      {}
    );

    return this.store.subscribe(() => {
      const state = this.store.getState();
      let hasChanged = false;
      const newValues = {};

      properties.forEach((prop) => {
        const newValue = state[prop];
        if (newValue !== currentValues[prop]) {
          hasChanged = true;
          newValues[prop] = newValue;
        }
      });

      if (hasChanged) {
        currentValues = { ...currentValues, ...newValues };
        listener(newValues);
      }
    });
  }

  /**
   * Provides feedback on a specific task.
   * This method is crucial for the Human-in-the-Loop (HITL) functionality,
   * allowing for human intervention and guidance in the AI workflow.
   *
   * @param {string} taskId - The ID of the task to provide feedback on.
   * @param {string} feedbackContent - The feedback to be incorporated into the task.
   * @returns {void}
   */
  provideFeedback(taskId, feedbackContent) {
    this.store.getState().provideFeedback(taskId, feedbackContent);
  }

  /**
   * Marks a task as validated.
   * This method is used in the HITL process to approve a task that required validation.
   *
   * @param {string} taskId - The ID of the task to be marked as validated.
   * @returns {void}
   */
  validateTask(taskId) {
    this.store.getState().validateTask(taskId);
  }

  /**
   * Subscribes to changes in the workflow status.
   * This method allows real-time monitoring of the overall workflow progress.
   *
   * @param {Function} callback - A function to be called when the workflow status changes.
   * @returns {Function} A function to unsubscribe from the status changes.
   *
   */
  onWorkflowStatusChange(callback) {
    return this.store.subscribe((state) => state.teamWorkflowStatus, callback);
  }

  /**
   * Retrieves tasks filtered by a specific status.
   *
   * @param {string} status - The status to filter tasks by. Should be one of TASK_STATUS_enum values.
   * @returns {Array} An array of tasks with the specified status.
   */
  getTasksByStatus(status) {
    return this.store.getState().tasks.filter((task) => task.status === status);
  }

  /**
   * Retrieves the current status of the workflow.
   * This method provides a snapshot of the workflow's current state.
   *
   * @returns {string} The current workflow status.
   */
  getWorkflowStatus() {
    return this.store.getState().teamWorkflowStatus;
  }

  /**
   * Retrieves the final result of the workflow.
   * This method should be called only after the workflow has finished.
   *
   * @returns {*|null} The workflow result if finished, null otherwise.
   */
  getWorkflowResult() {
    const state = this.store.getState();
    if (state.teamWorkflowStatus === WORKFLOW_STATUS_enum.FINISHED) {
      return state.workflowResult;
    }
    return null;
  }

  /**
   * Retrieves all tasks in the team's workflow.
   * This method provides a comprehensive view of all tasks and their current states.
   *
   * @returns {Array} An array of all tasks.
   */
  getTasks() {
    return this.store.getState().tasks;
  }
  /**
   * Retrieves the workflow completion statistics.
   * This method finds the completion log in the workflow logs and returns the associated statistics.
   *
   * @returns {Object|null} The workflow completion statistics, or null if no completion log is found.
   * @property {number} startTime - The timestamp representing the workflow start time.
   * @property {number} endTime - The timestamp representing the workflow end time.
   * @property {number} duration - The duration of the workflow in seconds.
   * @property {Object} llmUsageStats - Statistics about the language model usage.
   * @property {number} llmUsageStats.inputTokens - The number of input tokens used.
   * @property {number} llmUsageStats.outputTokens - The number of output tokens generated.
   * @property {number} llmUsageStats.callsCount - The number of LLM API calls made.
   * @property {number} llmUsageStats.callsErrorCount - The number of failed LLM API calls.
   * @property {number} llmUsageStats.parsingErrors - The number of parsing errors encountered.
   * @property {number} iterationCount - The number of iterations in the workflow.
   * @property {Object} costDetails - Detailed breakdown of costs associated with the workflow.
   * @property {number} costDetails.costInputTokens - The cost of input tokens.
   * @property {number} costDetails.costOutputTokens - The cost of output tokens.
   * @property {number} costDetails.totalCost - The total cost of the workflow.
   * @property {string} teamName - The name of the team that executed the workflow.
   * @property {number} taskCount - The total number of tasks in the workflow.
   * @property {number} agentCount - The number of agents involved in the workflow.
   */
  getWorkflowStats() {
    const state = this.store.getState();
    const logs = state.workflowLogs;

    // Find the log entry for when the workflow was marked as finished or blocked
    const completionLog = logs.find(
      (log) =>
        log.logType === "WorkflowStatusUpdate" &&
        (log.workflowStatus === "FINISHED" || log.workflowStatus === "BLOCKED")
    );

    // Check if a completion log exists and return the specified statistics
    if (completionLog) {
      const {
        startTime,
        endTime,
        duration,
        llmUsageStats,
        iterationCount,
        costDetails,
        teamName,
        taskCount,
        agentCount,
      } = completionLog.metadata;

      return {
        startTime,
        endTime,
        duration,
        llmUsageStats,
        iterationCount,
        costDetails,
        teamName,
        taskCount,
        agentCount,
      };
    } else {
      return null;
    }
  }
}

export { Agent, Task, Team };
