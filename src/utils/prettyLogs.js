/**
 * Pretty Logging Utilities.
 *
 * Enhances log outputs by formatting them into more readable and visually appealing structures. This file contains functions
 * that generate styled log entries for various operational states and outcomes within the KaibanJS library, making it easier
 * to interpret and review logs.
 *
 * Usage:
 * Use these functions to output enhanced visual logs for better clarity and easier debugging during development and monitoring.
 */

import ansis from "ansis";
import { logger } from "./logger";

function logPrettyTaskCompletion({
  iterationCount,
  duration,
  llmUsageStats,
  agentName,
  agentModel,
  taskTitle,
  currentTaskNumber,
  totalTasks,
  costDetails,
}) {
  const message = [
    ansis.black("\n+-----------------------------------------+"),
    ansis.bold(
      `| Task (${currentTaskNumber}/${totalTasks}) - status changed to ${ansis.green(
        "DONE"
      )}     |`
    ),
    "|-----------------------------------------|",
    ansis.bold("| Summary:"),
    "|",
    ansis.black("| Task: ") + ansis.cyan(taskTitle),
    ansis.black("| Agent: ") + ansis.cyan(agentName),
    ansis.black("| Model: ") + ansis.cyan(agentModel),
    "|",
    ansis.black("| Iterations: ") + ansis.cyan(iterationCount),
    ansis.black("| Duration: ") + ansis.cyan(duration) + ansis.cyan(" seconds"),
    ansis.black("| Input Tokens: ") + ansis.yellow(llmUsageStats.inputTokens),
    ansis.black("| Output Tokens: ") + ansis.yellow(llmUsageStats.outputTokens),
    "|",
    ansis.black("| Cost Input Tokens: ") +
      ansis.cyan(`$${costDetails.costInputTokens}`),
    ansis.black("| Cost Output Tokens: ") +
      ansis.cyan(`$${costDetails.costOutputTokens}`),
    ansis.black("| Total Cost: ") + ansis.cyan(`$${costDetails.totalCost}`),
    "|",
    ansis.black("| Calls Count: ") + ansis.green(llmUsageStats.callsCount),
    ansis.black("| Calls Error Count: ") +
      ansis.green(llmUsageStats.callsErrorCount),
    ansis.black("| Parsing Errors: ") +
      ansis.green(llmUsageStats.parsingErrors),
    ansis.black("+-----------------------------------------+\n\n"),
  ].join("\n");
  logger.info(message);
}

function logPrettyTaskStatus({
  currentTaskNumber,
  totalTasks,
  taskTitle,
  taskStatus,
  agentName,
}) {
  // Bold border and task status line
  logger.info(
    ansis.bold.black("||===========================================||")
  );
  logger.info(
    ansis.bold.black(
      `|| Task (${currentTaskNumber}/${totalTasks}) - status changed to ${
        taskStatus === "DONE"
          ? ansis.green(taskStatus)
          : ansis.yellow(taskStatus)
      }`
    )
  );
  logger.info(ansis.bold.black(`|| Title: ${taskTitle}`));
  logger.info(ansis.bold.black(`|| Agent: ${agentName}`));
  logger.info(
    ansis.bold.black("||===========================================||\n\n")
  );
}

// Function to log workflow status updates in a formatted manner
function logPrettyWorkflowStatus({ status, message }) {
  logger.info(`[Workflow Status: ${status}] ${message}`);
}

// Function to log workflow status updates in a formatted manner
function logPrettyWorkflowResult({ metadata }) {
  const {
    result,
    duration,
    llmUsageStats,
    iterationCount,
    costDetails,
    teamName,
    taskCount,
    agentCount,
  } = metadata;
  logger.info(`Workflow Result: ${result}`);
  const message = [
    ansis.black("\n+-----------------------------------------+"),
    ansis.bold(`| WORKFLOW - ${ansis.green("FINISH")}                       |`),
    "|-----------------------------------------|",
    ansis.bold("| Summary:"),
    "|",
    ansis.black("| Team: ") + ansis.cyan(teamName),
    ansis.black("| Tasks: ") + ansis.cyan(taskCount),
    ansis.black("| Agents: ") + ansis.cyan(agentCount),
    "|",
    ansis.black("| Iterations: ") + ansis.yellow(iterationCount),
    ansis.black("| Duration: ") +
      ansis.yellow(duration) +
      ansis.yellow(" seconds"),
    ansis.black("| Input Tokens: ") + ansis.yellow(llmUsageStats.inputTokens),
    ansis.black("| Output Tokens: ") + ansis.yellow(llmUsageStats.outputTokens),
    "|",
    ansis.black("| Cost Input Tokens: ") +
      ansis.cyan(`$${costDetails.costInputTokens}`),
    ansis.black("| Cost Output Tokens: ") +
      ansis.cyan(`$${costDetails.costOutputTokens}`),
    ansis.black("| Total Cost: ") + ansis.cyan(`$${costDetails.totalCost}`),
    "|",
    ansis.black("| Calls Count: ") + ansis.red(llmUsageStats.callsCount),
    ansis.black("| Calls Error Count: ") +
      ansis.red(llmUsageStats.callsErrorCount),
    ansis.black("| Parsing Errors: ") + ansis.red(llmUsageStats.parsingErrors),
    ansis.black("+-----------------------------------------+\n"),
  ].join("\n");
  logger.info(message);
}

export {
  logPrettyTaskCompletion,
  logPrettyTaskStatus,
  logPrettyWorkflowStatus,
  logPrettyWorkflowResult,
};
