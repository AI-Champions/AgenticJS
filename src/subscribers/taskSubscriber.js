/**
 * Task Status Subscriber.
 *
 * Listens to changes in task status within the library's state management system, providing logs and reactive behaviors to these changes.
 * This helps in monitoring task progression and debugging issues in real-time.
 *
 * Usage:
 * Deploy this subscriber to actively monitor and respond to changes in task status, enhancing the observability and responsiveness of your application.
 */

import { TASK_STATUS_enum } from "../utils/enums";
import { getTaskTitleForLogs } from "../utils/tasks";
import {
  logPrettyTaskCompletion,
  logPrettyTaskStatus,
} from "../utils/prettyLogs";

const subscribeTaskStatusUpdates = (useStore) => {
  useStore.subscribe(
    (state) => state.workflowLogs,
    (newLogs, previousLogs) => {
      if (newLogs.length > previousLogs.length) {
        // Check if a new log has been added
        const newLog = newLogs[newLogs.length - 1]; // Get the latest log

        if (newLog.logType === "TaskStatusUpdate") {
          const totalTasks = useStore.getState().tasks.length;
          const taskIndex = useStore
            .getState()
            .tasks.findIndex((t) => t.id === newLog.task.id);
          const currentTaskNumber = taskIndex + 1; // Adding 1 because index is 0-based

          switch (newLog.task.status) {
            case TASK_STATUS_enum.DONE:
              logPrettyTaskCompletion({
                task: newLog.task,
                llmUsageStats: newLog.metadata.llmUsageStats,
                iterationCount: newLog.metadata.iterationCount,
                duration: newLog.metadata.duration,
                agentName: newLog.agent.name,
                agentModel: newLog.agent.llmConfig.model,
                taskTitle: getTaskTitleForLogs(newLog.task),
                currentTaskNumber,
                costDetails: newLog.metadata.costDetails,
                totalTasks,
              });
              break;
            case TASK_STATUS_enum.DOING:
            case TASK_STATUS_enum.BLOCKED:
            case TASK_STATUS_enum.REVISE:
            case TASK_STATUS_enum.AWAITING_VALIDATION:
            case TASK_STATUS_enum.VALIDATED:
            case TASK_STATUS_enum.TODO:
              logPrettyTaskStatus({
                currentTaskNumber,
                totalTasks,
                taskTitle: getTaskTitleForLogs(newLog.task),
                taskStatus: newLog.task.status,
                agentName: newLog.agent.name,
              });
              break;
            default:
              console.warn(
                `Encountered an unexpected task status: ${newLog.task.status}`
              );
              break;
          }
        }
      }
    }
  );
};

export { subscribeTaskStatusUpdates };
