import AgentsBoardDebugger from "./AgentsBoardDebugger";
import team from "./teams/product_specs/openai";

function App() {
  return (
    <div className="mainContent">
      <h1>KaibanJS Playground</h1>
      <AgentsBoardDebugger team={team} />
    </div>
  );
}

export default App;
