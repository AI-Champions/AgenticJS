/**
 * Workflow Controller Setup.
 *
 * Configures and controls the task execution workflow within a team context, using a queue system to manage the sequential
 * execution of tasks based on their statuses. It ensures tasks are processed in the correct order and handles status updates.
 *
 * Usage:
 * Integrate this controller to manage the flow of tasks within your application, ensuring tasks are executed in an orderly and efficient manner.
 */

import PQueue from "p-queue";
import { TASK_STATUS_enum } from "../utils/enums";

export const setupWorkflowController = (useTeamStore) => {
  const taskQueue = new PQueue({ concurrency: 1 });

  // Managing tasks moving to 'DOING'
  useTeamStore.subscribe(
    (state) => state.tasks.filter((t) => t.status === TASK_STATUS_enum.DOING),
    (doingTasks, previousDoingTasks) => {
      doingTasks.forEach((task) => {
        if (!previousDoingTasks.find((t) => t.id === task.id)) {
          taskQueue
            .add(() => useTeamStore.getState().workOnTask(task.agent, task))
            .catch((error) => {
              useTeamStore.getState().handleTaskError({ task, error });
              useTeamStore.getState().handleWorkflowError(task, error);
            });
        }
      });
    }
  );

  // Helper function to check if an agent is busy
  const isAgentBusy = (agent, tasks) => {
    return tasks.some(
      (t) => t.agent.id === agent.id && t.status === TASK_STATUS_enum.DOING
    );
  };

  // Managing tasks moving to 'REVISE'
  useTeamStore.subscribe(
    (state) => state.tasks.filter((t) => t.status === TASK_STATUS_enum.REVISE),
    (reviseTasks, previousReviseTasks) => {
      const allTasks = useTeamStore.getState().tasks;

      reviseTasks.forEach((reviseTask) => {
        if (!previousReviseTasks.find((t) => t.id === reviseTask.id)) {
          // Find the index of the current revise task
          const taskIndex = allTasks.findIndex((t) => t.id === reviseTask.id);

          // Check if the associated agent is not busy
          if (!isAgentBusy(reviseTask.agent, allTasks)) {
            // Put the task in DOING status
            useTeamStore
              .getState()
              .updateTaskStatus(reviseTask.id, TASK_STATUS_enum.DOING);
          }

          // Move all subsequent tasks to TODO
          for (let i = taskIndex + 1; i < allTasks.length; i++) {
            useTeamStore
              .getState()
              .updateTaskStatus(allTasks[i].id, TASK_STATUS_enum.TODO);
          }
        }
      });
    }
  );

  // Managing tasks moving to 'DONE'
  useTeamStore.subscribe(
    (state) => state.tasks.filter((t) => t.status === "DONE"),
    (doneTasks, previousDoneTasks) => {
      if (doneTasks.length > previousDoneTasks.length) {
        const tasks = useTeamStore.getState().tasks;
        const nextTask = tasks.find((t) => t.status === TASK_STATUS_enum.TODO);
        if (nextTask) {
          useTeamStore
            .getState()
            .updateTaskStatus(nextTask.id, TASK_STATUS_enum.DOING);
        }
      }
    }
  );
};
