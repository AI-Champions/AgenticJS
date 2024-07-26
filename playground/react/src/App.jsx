import AgentsBoardDebugger from "./components/AgentDebbuger/AgentsBoardDebugger";
import team from './teams/openai/productSpecsTeam';
import "./index.css";

function App() {
    return (
        <div className="mainContent">
            <AgentsBoardDebugger team={team} />
        </div>
    );
}

export default App;
