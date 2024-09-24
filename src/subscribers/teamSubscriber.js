/**
 * Workflow Status Subscriber.
 *
 * Monitors changes in the workflow status, logging significant events and updating the system state accordingly.
 * This is crucial for maintaining a clear overview of workflow progress and handling potential issues promptly.
 *
 * Usage:
 * Use this subscriber to keep track of workflow statuses, enabling proactive management of workflows and their states.
 */

import {
  logPrettyWorkflowStatus,
  logPrettyWorkflowResult,
} from "../utils/prettyLogs";
import { WORKFLOW_STATUS_enum } from "../utils/enums";

const subscribeWorkflowStatusUpdates = (useStore) => {
  useStore.subscribe(
    (state) => state.workflowLogs,
    (newLogs, previousLogs) => {
      if (newLogs.length > previousLogs.length) {
        const newLog = newLogs[newLogs.length - 1];
        if (newLog.logType === "WorkflowStatusUpdate") {
          switch (newLog.workflowStatus) {
            case WORKFLOW_STATUS_enum.INITIAL:
              logPrettyWorkflowStatus({
                status: "Initial",
                message: "Workflow is being initialized.",
              });
              break;
            case WORKFLOW_STATUS_enum.RUNNING:
              logPrettyWorkflowStatus({
                status: "Running",
                message: "Workflow is actively processing tasks.",
              });
              break;
            case WORKFLOW_STATUS_enum.STOPPING:
              logPrettyWorkflowStatus({
                status: "Stopping",
                message: "Workflow is stopping.",
              });
              break;
            case WORKFLOW_STATUS_enum.STOPPED:
              logPrettyWorkflowStatus({
                status: "Stopped",
                message: "Workflow has been stopped.",
              });
              break;
            case WORKFLOW_STATUS_enum.ERRORED:
              logPrettyWorkflowStatus({
                status: "Errored",
                message: "Workflow encountered an error.",
              });
              break;
            case WORKFLOW_STATUS_enum.FINISHED:
              logPrettyWorkflowStatus({
                status: "Finished",
                message: "Workflow has successfully completed all tasks.",
              });
              logPrettyWorkflowResult({ ...newLog });
              break;
            case WORKFLOW_STATUS_enum.BLOCKED:
              logPrettyWorkflowStatus({
                status: "Blocked",
                message:
                  "Workflow is blocked due to one or more blocked tasks.",
              });
              break;
            default:
              console.warn(
                `Encountered an unexpected workflow status: ${newLog.workflowStatus}`
              );
              break;
          }
        }
      }
    }
  );
};

export { subscribeWorkflowStatusUpdates };
