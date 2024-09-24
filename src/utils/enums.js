/**
 * Enumeration Definitions.
 *
 * This file defines various enumerations used throughout the KaibanJS library, such as agent statuses, task statuses,
 * and workflow states. These enums provide a standardized set of constants that facilitate clear and consistent state management
 * and behavior handling across different components of the library.
 *
 * Usage:
 * Reference these enums to ensure consistent state management and behavior checks across the library's various functional areas.
 */

//──── Agent Status Definitions ───────────────────────────────────────
//
// INITIAL: The agent is set up and waiting to start the task.
// THINKING: The agent is strategizing and planning the approach based on the initial input.
// THOUGHT: The agent has formed a plan and is ready to act. This involves deciding on specific actions based on the reasoning.
// EXECUTING_ACTION: The agent is actively performing the actions determined in the thought phase.
// USING_TOOL: The agent is interacting with external tools to gather or verify information necessary for completing the task.
// OBSERVATION: The agent analyzes the results from the tools to update its understanding and plan.
// FINAL_ANSWER: The agent concludes the task with a final decision based on all collected and processed information.
// IDLE: The agent is idle, waiting for new instructions or tasks.
//
// ─────────────────────────────────────────────────────────────────────

const AGENT_STATUS_enum = {
  INITIAL: "INITIAL",
  THINKING: "THINKING", // LangChain Callback: llmStart()
  THINKING_END: "THINKING_END", // LangChain Callback: llmEnd()
  THINKING_ERROR: "THINKING_ERROR", // LangChain Callback: handleLLMError()
  THOUGHT: "THOUGHT", // LangChain Callback: llmEnd() and THOUGH Present in the output
  EXECUTING_ACTION: "EXECUTING_ACTION", // LangChain Callback: handleAgentAction()
  USING_TOOL: "USING_TOOL", // LangChain Callback: handleToolStart()
  USING_TOOL_END: "USING_TOOL_END",
  USING_TOOL_ERROR: "USING_TOOL_ERROR", // LangChain Callback: handleToolError()
  TOOL_DOES_NOT_EXIST: "TOOL_DOES_NOT_EXIST",
  OBSERVATION: "OBSERVATION", // LangChain Callback: handleToolEnd()
  FINAL_ANSWER: "FINAL_ANSWER", // LangChain Callback: handleAgentEnd(),
  TASK_COMPLETED: "TASK_COMPLETED", // Indicates all task operations, including final outputs, are completed
  MAX_ITERATIONS_ERROR: "MAX_ITERATIONS_ERROR",
  ISSUES_PARSING_LLM_OUTPUT: "ISSUES_PARSING_LLM_OUTPUT",
  SELF_QUESTION: "SELF_QUESTION",
  ITERATION_START: "ITERATION_START",
  ITERATION_END: "ITERATION_END",
  AGENTIC_LOOP_ERROR: "AGENTIC_LOOP_ERROR",
  WEIRD_LLM_OUTPUT: "WEIRD_LLM_OUTPUT",
};

// ──── Task Status Definitions ───────────────────────────────────────
//
// TODO: Task is queued for initiation, awaiting processing.
// DOING: Task is actively being worked on.
// BLOCKED: Progress on the task is halted due to dependencies or obstacles.
// REVISE: Task requires additional review or adjustments.
// DONE: Task is completed and requires no further action.
// AWAITING_VALIDATION: Task is completed but requires validation or approval.
// VALIDATE: Task has been validated and confirmed as correctly completed.
//
// ─────────────────────────────────────────────────────────────────────

const TASK_STATUS_enum = {
  TODO: "TODO",
  DOING: "DOING",
  BLOCKED: "BLOCKED",
  REVISE: "REVISE",
  DONE: "DONE",
  AWAITING_VALIDATION: "AWAITING_VALIDATION",
  VALIDATED: "VALIDATED",
};

// ──── Workflow Status Definitions ───────────────────────────────────────
//
// INITIAL: The very beginning of the workflow process, before any action has been initiated.
// RUNNING: The workflow is actively processing tasks, indicating that the workflow is in full operation.
// STOPPING: The workflow is in the process of being stopped, which could be due to task completion, a manual stop command, or other reasons.
// STOPPED: The workflow has been completely stopped and is in a stable state, ready for review or restart.
// ERRORED: The workflow has encountered a critical issue and has halted unexpectedly, requiring error handling or intervention.
// FINISHED: The workflow has successfully completed all its tasks and no further operational actions are required.
// BLOCKED: The workflow is unable to proceed due to one or more tasks being blocked, requiring administrative review or automated recovery actions to resume or terminate the blocked tasks.
//
// ─────────────────────────────────────────────────────────────────────────

const WORKFLOW_STATUS_enum = {
  INITIAL: "INITIAL",
  RUNNING: "RUNNING",
  STOPPING: "STOPPING",
  STOPPED: "STOPPED",
  ERRORED: "ERRORED",
  FINISHED: "FINISHED",
  BLOCKED: "BLOCKED",
};

// ──── Feedback Status Definitions ───────────────────────────────────────
//
// PENDING: Feedback has been received but not yet processed or addressed.
// PROCESSED: Feedback has been successfully addressed and incorporated.
//
// ───────────────────────────────────────────────────────────────────────

const FEEDBACK_STATUS_enum = {
  PENDING: "PENDING",
  PROCESSED: "PROCESSED",
};

export {
  AGENT_STATUS_enum,
  TASK_STATUS_enum,
  WORKFLOW_STATUS_enum,
  FEEDBACK_STATUS_enum,
};
