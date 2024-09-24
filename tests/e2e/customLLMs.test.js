require("dotenv").config({ path: "./.env.local" });

const openAITeam = require("./examples/teams/llms/openai");

describe("Custom LLMs Instances Workflows", () => {
  describe("Using OpenAI Intance", () => {
    it("initializes the team successfully", async () => {
      const store = openAITeam.useStore();
      expect(store.getState().getCleanedState()).toMatchSnapshot();
    });
  });
});
