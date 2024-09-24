/**
 * Task Store Management.
 *
 * Defines the Zustand store slice for task management, handling task lifecycle events such as completion, updates, and errors.
 * It ensures tasks are managed consistently with the ability to react to changes in task status and handle errors effectively.
 *
 * Usage:
 * Use this store to manage tasks within your application, providing a robust system for updating and tracking task progress and state.
 */

import {
  TASK_STATUS_enum,
  AGENT_STATUS_enum,
  FEEDBACK_STATUS_enum,
} from "../utils/enums";
import { getTaskTitleForLogs } from "../utils/tasks";
import { logger } from "../utils/logger";
import { PrettyError } from "../utils/errors";
import { calculateTaskCost } from "../utils/llmCostCalculator";

export const useTaskStore = (set, get) => ({
  // state
  tasksInitialized: false,

  getTaskStats(task) {
    const endTime = Date.now();
    const lastDoingLog = get()
      .workflowLogs.slice()
      .reverse()
      .find(
        (log) =>
          log.task &&
          log.task.id === task.id &&
          log.logType === "TaskStatusUpdate" &&
          log.taskStatus === TASK_STATUS_enum.DOING
      );
    const startTime = lastDoingLog ? lastDoingLog.timestamp : endTime; // Use endTime if no DOING log is found
    const duration = (endTime - startTime) / 1000; // Calculate duration in seconds

    let llmUsageStats = {
      inputTokens: 0,
      outputTokens: 0,
      callsCount: 0,
      callsErrorCount: 0,
      parsingErrors: 0,
    };
    let iterationCount = 0;

    get().workflowLogs.forEach((log) => {
      if (
        log.task &&
        log.task.id === task.id &&
        log.timestamp >= startTime &&
        log.logType === "AgentStatusUpdate"
      ) {
        if (log.agentStatus === AGENT_STATUS_enum.THINKING_END) {
          llmUsageStats.inputTokens +=
            log.metadata.output.llmUsageStats.inputTokens;
          llmUsageStats.outputTokens +=
            log.metadata.output.llmUsageStats.outputTokens;
          llmUsageStats.callsCount += 1;
        }
        if (log.agentStatus === AGENT_STATUS_enum.THINKING_ERROR) {
          llmUsageStats.callsErrorCount += 1;
        }
        if (log.agentStatus === AGENT_STATUS_enum.ISSUES_PARSING_LLM_OUTPUT) {
          llmUsageStats.parsingErrors += 1;
        }
        if (log.agentStatus === AGENT_STATUS_enum.ITERATION_END) {
          iterationCount += 1;
        }
      }
    });

    return {
      startTime,
      endTime,
      duration,
      llmUsageStats,
      iterationCount,
    };
  },

  handleTaskCompleted: ({ agent, task, result }) => {
    const stats = get().getTaskStats(task, get);
    task.result = result;

    const updatedFeedbackHistory = (task.feedbackHistory || []).map(
      (feedback) =>
        feedback.status === FEEDBACK_STATUS_enum.PENDING
          ? { ...feedback, status: FEEDBACK_STATUS_enum.PROCESSED }
          : feedback
    );

    if (
      task.externalValidationRequired &&
      task.status !== TASK_STATUS_enum.VALIDATED
    ) {
      task.status = TASK_STATUS_enum.AWAITING_VALIDATION;
      const modelCode = agent.llmConfig.model; // Assuming this is where the model code is stored
      // Calculate costs directly using stats
      const costDetails = calculateTaskCost(modelCode, stats.llmUsageStats);
      const taskLog = get().prepareNewLog({
        agent,
        task,
        logDescription: `Task awaiting validation: ${getTaskTitleForLogs(
          task
        )}. Awaiting validation.`,
        metadata: {
          ...stats,
          costDetails,
          result,
        },
        logType: "TaskStatusUpdate",
      });

      // What status to give the workflow here?
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === task.id
            ? {
                ...t,
                ...stats,
                status: TASK_STATUS_enum.AWAITING_VALIDATION,
                result: result,
                feedbackHistory: updatedFeedbackHistory,
              }
            : t
        ),
        workflowLogs: [...state.workflowLogs, taskLog],
      }));

      get().handleWorkflowBlocked({
        task,
        error: new Error("Task awaiting validation"),
      });
    } else {
      task.status = TASK_STATUS_enum.DONE;
      const modelCode = agent.llmConfig.model; // Assuming this is where the model code is stored
      // Calculate costs directly using stats
      const costDetails = calculateTaskCost(modelCode, stats.llmUsageStats);
      const taskLog = get().prepareNewLog({
        agent,
        task,
        logDescription: `Task completed: ${getTaskTitleForLogs(task)}.`,
        metadata: {
          ...stats,
          costDetails,
          result,
        },
        logType: "TaskStatusUpdate",
      });
      logger.debug(
        `Task completed with ID ${task.id}, Duration: ${stats.duration} seconds`
      );
      set((state) => ({
        ...state,
        workflowLogs: [...state.workflowLogs, taskLog],
        tasks: state.tasks.map((t) =>
          t.id === task.id
            ? {
                ...t,
                ...stats,
                status: TASK_STATUS_enum.DONE,
                result: result,
                feedbackHistory: updatedFeedbackHistory,
              }
            : t
        ),
      }));

      // This logic is here cause if put it in a subscriber, it will create race conditions
      // that will create a a non deterministic behavior for the Application State
      const tasks = get().tasks;
      const allTasksDone = tasks.every(
        (t) => t.status === TASK_STATUS_enum.DONE
      );
      if (allTasksDone) {
        get().finishWorkflowAction();
      }
    }
  },

  handleTaskError: ({ task, error }) => {
    const stats = get().getTaskStats(task, get);
    task.status = TASK_STATUS_enum.BLOCKED;
    const modelCode = task.agent.llmConfig.model; // Assuming this is where the model code is stored
    // Calculate costs directly using stats
    const costDetails = calculateTaskCost(modelCode, stats.llmUsageStats);
    const updatedFeedbackHistory = task.feedbackHistory.map((f) =>
      f.status === FEEDBACK_STATUS_enum.PENDING
        ? { ...f, status: FEEDBACK_STATUS_enum.PROCESSED }
        : f
    );
    const taskLog = get().prepareNewLog({
      agent: task.agent,
      task,
      logDescription: `Task error: ${getTaskTitleForLogs(task)}, Error: ${
        error.message
      }`,
      metadata: {
        ...stats,
        costDetails,
        error: error.message,
      },
      logType: "TaskStatusUpdate",
    });

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === task.id
          ? {
              ...t,
              ...stats,
              status: TASK_STATUS_enum.BLOCKED,
              error: error.message,
              feedbackHistory: updatedFeedbackHistory,
            }
          : t
      ),
      workflowLogs: [...state.workflowLogs, taskLog],
    }));

    const prettyError = new PrettyError({
      message: "Task Error Encountered",
      recommendedAction:
        "Try to debug the application to find the root cause of the error.",
      rootError: error,
      context: { task, error },
      location: "taskStore.js -> handleTaskError()",
    });

    logger.error(prettyError.prettyMessage);
  },

  // Centralized error handling method for tasks
  handleTaskBlocked: ({ task, error }) => {
    const stats = get().getTaskStats(task, get);
    task.status = TASK_STATUS_enum.BLOCKED;
    const modelCode = task.agent.llmConfig.model; // Assuming this is where the model code is stored
    // Calculate costs directly using stats
    const costDetails = calculateTaskCost(modelCode, stats.llmUsageStats);

    const updatedFeedbackHistory = task.feedbackHistory.map((f) =>
      f.status === FEEDBACK_STATUS_enum.PENDING
        ? { ...f, status: FEEDBACK_STATUS_enum.PROCESSED }
        : f
    );

    const taskLog = get().prepareNewLog({
      agent: task.agent,
      task,
      logDescription: `Task blocked: ${getTaskTitleForLogs(task)}, Reason: ${
        error.message
      }`,
      metadata: {
        ...stats,
        costDetails,
        error,
      },
      logType: "TaskStatusUpdate",
    });

    const prettyError = new PrettyError({
      name: "TASK BLOCKED",
      message: "Task blocked due to a possible error during execution.",
      recommendedAction:
        'Enable logLevel: "debug" during team initialization to obtain more detailed logs and facilitate troubleshooting.',
      rootError: error,
      context: { task, error },
    });

    logger.warn(prettyError.prettyMessage);
    logger.debug(prettyError.context);
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === task.id
          ? {
              ...t,
              ...stats,
              status: TASK_STATUS_enum.BLOCKED,
              feedbackHistory: updatedFeedbackHistory,
            }
          : t
      ),
      workflowLogs: [...state.workflowLogs, taskLog],
    }));
    get().handleWorkflowBlocked({ task, error });
  },
});
