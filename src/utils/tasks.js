/**
 * Task Utility Functions.
 *
 * This file includes utility functions for managing task properties and behaviors within the KaibanJS library. It offers
 * capabilities to interpolate task descriptions with dynamic data and retrieve concise titles for logging purposes.
 *
 * Usage:
 * Implement these utilities to dynamically manage task data and enhance logging outputs with more informative task descriptions.
 */

function getTaskTitleForLogs(task) {
  return (
    task.title ||
    (task.description
      ? task.description.split(" ").slice(0, 3).join(" ") + "..."
      : "Untitled")
  );
}

function interpolateTaskDescription(description, inputs) {
  let result = description;

  for (const key in inputs) {
    const placeholder = `{${key}}`;
    result = result.replace(placeholder, inputs[key]);
  }

  return result;
}

export { getTaskTitleForLogs, interpolateTaskDescription };
