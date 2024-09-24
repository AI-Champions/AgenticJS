import { useEffect, useState } from "react";
import Spinner from "./components/Spinner";

const WorkflowStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="section">
      <h3>📊 Workflow Statistics</h3>
      <p>
        <strong>Team Name:</strong> {stats.teamName}
      </p>
      <p>
        <strong>Duration:</strong> {stats.duration.toFixed(2)} seconds
      </p>
      <p>
        <strong>Tasks:</strong> {stats.taskCount}
      </p>
      <p>
        <strong>Agents:</strong> {stats.agentCount}
      </p>
      <p>
        <strong>Iterations:</strong> {stats.iterationCount}
      </p>
      <h4>LLM Usage:</h4>
      <ul>
        <li>Input Tokens: {stats.llmUsageStats.inputTokens}</li>
        <li>Output Tokens: {stats.llmUsageStats.outputTokens}</li>
        <li>API Calls: {stats.llmUsageStats.callsCount}</li>
        <li>Errors: {stats.llmUsageStats.callsErrorCount}</li>
        <li>Parsing Errors: {stats.llmUsageStats.parsingErrors}</li>
      </ul>
      <p>
        <strong>Total Cost:</strong> ${stats.costDetails.totalCost.toFixed(4)}
      </p>
    </div>
  );
};

const AgentsBoardDebugger = ({ team, title = null }) => {
  const useTeamStore = team.useStore();
  const {
    agents,
    tasks,
    workflowLogs,
    teamWorkflowStatus,
    workflowResult,
    inputs,
    setInputs,
    workflowContext,
    provideFeedback,
    validateTask,
  } = useTeamStore((state) => ({
    agents: state.agents,
    tasks: state.tasks,
    workflowLogs: state.workflowLogs,
    teamWorkflowStatus: state.teamWorkflowStatus,
    workflowResult: state.workflowResult,
    inputs: state.inputs,
    setInputs: state.setInputs,
    workflowContext: state.workflowContext,
    provideFeedback: state.provideFeedback,
    validateTask: state.validateTask,
  }));

  const [openSystemMessage, setOpenSystemMessage] = useState({});
  const [openWorkflowContext, setOpenWorkflowContext] = useState(false);

  const [feedbackContent, setFeedbackContent] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState("");

  const [workflowStats, setWorkflowStats] = useState(null);

  const handleFeedbackSubmit = () => {
    if (selectedTaskId && feedbackContent) {
      provideFeedback(selectedTaskId, feedbackContent);
      setFeedbackContent("");
      setSelectedTaskId("");
    }
  };

  const handleTaskValidation = (taskId, isApproved) => {
    if (isApproved) {
      validateTask(taskId);
    } else {
      provideFeedback(taskId, "Task needs revision");
    }
  };

  const toggleSystemMessage = (id) => {
    setOpenSystemMessage((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleWorkflowContext = () => {
    setOpenWorkflowContext((prev) => !prev);
  };

  const [statusLog, setStatusLog] = useState([]);

  useEffect(() => {
    setStatusLog((prevLog) => [...prevLog, teamWorkflowStatus]);
  }, [teamWorkflowStatus]);

  // useEffect(() => {
  //     console.log('Tasks:', tasks);
  // }, [tasks]);

  const startTeam = async () => {
    try {
      const output = await team.start(inputs);
      if (output.status === "FINISHED") {
        setWorkflowStats(output.stats);
      } else if (output.status === "BLOCKED") {
        setWorkflowStats(output.stats);
      }
    } catch (error) {
      console.error("Workflow encountered an error:", error);
    }
  };

  return (
    <div>
      <h1 className="title">Agents Team Debugger</h1>
      {title && <h2 className="sectionTitle">{title}</h2>}

      <div className="inputSection">
        <h2 className="sectionTitle">Team Inputs</h2>
        <textarea
          className="inputTextarea"
          value={JSON.stringify(inputs, null, 2)}
          onChange={(e) => setInputs(JSON.parse(e.target.value))}
          placeholder="Enter JSON input"
        />

        <div className="actionWrapper">
          <button className="actionButton" onClick={startTeam}>
            Start Workflow
          </button>

          {teamWorkflowStatus === "running_workflow" && <Spinner />}
        </div>
      </div>

      <div className="section">
        <h2 className="sectionTitle">🕵️‍♂️ Agents</h2>
        <ul>
          {agents.map((agent) => (
            <li key={agent.id} className="listItem agentName">
              <span>
                🔘{" "}
                <strong>
                  {agent.name} - {agent.role}{" "}
                </strong>{" "}
                - [{agent.type}] - [{agent.llmConfig.provider}-{" "}
                {agent.llmConfig.model}] - status: ({agent.status})
              </span>

              {agent.llmSystemMessage && (
                <div
                  className="llm_system_message"
                  onClick={() => toggleSystemMessage(agent.id)}
                >
                  {openSystemMessage[agent.id]
                    ? "Hide System Message"
                    : "Show System Message"}
                </div>
              )}
              {openSystemMessage[agent.id] && (
                <div className="listItem">
                  System Message: {agent.llmSystemMessage}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2 className="sectionTitle">📝 Tasks</h2>
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className="listItem">
              <div className="taskContainer">
                <span className="taskDescription">🔘 {task.description}</span>
                <span className="taskStatus">
                  {task.status}{" "}
                  {task.status === "doing" && <Spinner color="white" />}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2 className="sectionTitle">🔄 Team Workflow Status Changes</h2>

        <ul>
          {statusLog.map((status, index) => (
            <li key={index} className="listItem">
              Status: {status}
            </li>
          ))}
        </ul>
      </div>

      {workflowStats && <WorkflowStats stats={workflowStats} />}
      <div className="section">
        <h2 className="sectionTitle" onClick={toggleWorkflowContext}>
          {openWorkflowContext ? "▼" : "▶"} 🧠 Workflow Context
        </h2>
        {openWorkflowContext && (
          <div className="listItem">
            {workflowContext ? workflowContext : "No context available"}
          </div>
        )}
      </div>

      <div className="section">
        <h2 className="sectionTitle">📊 Task Results</h2>

        <ul>
          {tasks.map((task) => (
            <li
              key={task.id}
              className="listItem taskResult_Container last_child"
            >
              <div>
                <strong className="subtitle">Task:</strong>
                <span> {task.description} </span>
              </div>

              <div>
                <strong className="subtitle">Time:</strong>
                <span>
                  {" "}
                  {task.duration
                    ? `${task.duration} seconds`
                    : "Not yet available"}
                </span>
              </div>

              <div className="taskResult_response">
                <p>
                  <strong className="subtitle">Result:</strong>
                </p>

                <p>{task.result ? task.result : "Not yet available"}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2 className="sectionTitle">Workflow Result</h2>
        <div>
          {workflowResult ? (
            workflowResult
          ) : (
            <div className="noAvailableData">
              <span>Not yet available</span>
            </div>
          )}
        </div>
      </div>

      <div className="section">
        <h2 className="sectionTitle">👥 Human in the Loop (HITL)</h2>
        <div className="hitl_Container">
          <select
            value={selectedTaskId}
            className="hitl-select"
            onChange={(e) => setSelectedTaskId(e.target.value)}
          >
            <option value="">Select a task</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.description}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="hitl-feedback"
            value={feedbackContent}
            onChange={(e) => setFeedbackContent(e.target.value)}
            placeholder="Enter feedback"
          />
          <button className="hitl-button" onClick={handleFeedbackSubmit}>
            Submit Feedback
          </button>
        </div>
      </div>

      <div className="section">
        <h2 className="sectionTitle">📝 Tasks</h2>
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className="listItem">
              <p>
                🔘 {task.description} - {task.status}
              </p>
              {task.status === "AWAITING_VALIDATION" && (
                <div className="awaiting_validation_buttons">
                  <button onClick={() => handleTaskValidation(task.id, true)}>
                    Approve
                  </button>
                  <button onClick={() => handleTaskValidation(task.id, false)}>
                    Request Revision
                  </button>
                </div>
              )}

              {task.feedbackHistory && task.feedbackHistory.length > 0 && (
                <div>
                  <strong>Feedback History:</strong>
                  {task.feedbackHistory.map((feedback, index) => (
                    <p key={index} className="listItem">
                      - {feedback.content} (Status: {feedback.status})
                    </p>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2 className="sectionTitle">📋 Workflow Logs</h2>

        <ul>
          {workflowLogs.map((log, index) => (
            <li key={index} className="listItem">
              {log.logType !== "WorkflowStatusUpdate" ? (
                <p>
                  🔘 ({log.taskStatus}) - ({log.taskTitle}) - ({log.agentName})
                  - ({log.agentStatus}) - timestamp: {log.timestamp} -{" "}
                  {log.agent?.name} - {log.task?.description}
                </p>
              ) : (
                <p>
                  🔘 Workflow Status Update - ({log.workflowStatus}) timestamp:{" "}
                  {log.timestamp}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AgentsBoardDebugger;
