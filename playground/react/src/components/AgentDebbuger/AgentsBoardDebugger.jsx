import { useEffect, useState } from "react";
import Spinner from "../Spinner/Spinner";
import "./appDebuggerStyles.css";

const AgentsBoardDebugger = ({ team }) => {
    const useTeamStore = team.useStore();
    const {
        agents,
        tasks,
        workflowLogs,
        teamWorkflowStatus,
        workflowResult,
        inputs,
        setInputs,
    } = useTeamStore((state) => ({
        agents: state.agents,
        tasks: state.tasks,
        workflowLogs: state.workflowLogs,
        teamWorkflowStatus: state.teamWorkflowStatus,
        workflowResult: state.workflowResult,
        inputs: state.inputs,
        setInputs: state.setInputs,
    }));
    console.log("🚀 ~ AgentsBoardDebugger ~ workflowLogs:", workflowLogs);

    const [statusLog, setStatusLog] = useState([teamWorkflowStatus]);

    useEffect(() => {
        const unsub = useTeamStore.subscribe((state, previusState) => {
            if (state.teamWorkflowStatus !== previusState.teamWorkflowStatus)
                setStatusLog((prevLog) => [
                    ...prevLog,
                    state.teamWorkflowStatus,
                ]);
        });

        return unsub;
    }, []);

    const startTeam = () => {
        try {
            team.start(inputs);
        } catch (error) {
            console.error("Invalid JSON input:", error);
        }
    };

    return (
        <div>
            <h1 className="title">Agents Team Debugger</h1>
            <div className="inputSection">
                <h2 className="sectionTitle">Team Inputs</h2>
                <div>
                    <textarea
                        value={JSON.stringify(inputs, null, 2)}
                        onChange={(e) => setInputs(JSON.parse(e.target.value))}
                        placeholder="Enter JSON input"
                        className="inputTextarea"
                    />
                </div>

                <div className="actionWrapper">
                    <button onClick={startTeam} className="actionButton">
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
                                {agent.name} - {agent.role}
                            </span>
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
                                <span className="taskDescription">
                                    {task.description}
                                </span>
                                <span className="taskStatus">
                                    {task.status}{" "}
                                    {task.status === "doing" && (
                                        <Spinner color="white" />
                                    )}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="section">
                <h2 className="sectionTitle">
                    🔄 Team Workflow Status Changes
                </h2>

                <ul>
                    {statusLog.map((status, index) => (
                        <li key={index} className="listItem">
                            Status: {status}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="section">
                <h2 className="sectionTitle">📋 Task Logs</h2>

                {workflowLogs.length > 0 ? (
                    <ul>
                        {workflowLogs
                            .filter(
                                (log, index, self) =>
                                    index ===
                                    self.findIndex(
                                        (t) =>
                                            t.task.description ===
                                                log.task.description &&
                                            t.timestamp === log.timestamp &&
                                            t.agent.name === log.agent.name &&
                                            t.task.status === log.task.status
                                    )
                            )
                            .map((log) => (
                                <li
                                    key={
                                        log.task.id +
                                        log.task.status +
                                        log.agent.name +
                                        log.logDescription
                                    }
                                    className="listItem"
                                >
                                    ({log.task.status}) - timestamp:{" "}
                                    {log.timestamp} - {log.agent.name} -{" "}
                                    {log.task.description}
                                </li>
                            ))}
                    </ul>
                ) : (
                    <div className="noAvailableData">
                        <span>Not yet available</span>
                    </div>
                )}
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
                                    <strong className="subtitle">
                                        Result:
                                    </strong>
                                </p>

                                <p>
                                    {task.result
                                        ? task.result
                                        : "Not yet available"}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AgentsBoardDebugger;
