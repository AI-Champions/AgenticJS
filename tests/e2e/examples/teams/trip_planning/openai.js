const { Agent, Task, Team } = require("kaibanjs");
const {
  TavilySearchResults,
} = require("@langchain/community/tools/tavily_search");

// const {calculator} = require('@agentic/stdlib/calculator');
// const { createLangChainTools } = require('@agentic/stdlib/langchain');

// Define tools
const searchInternetTool = new TavilySearchResults({
  maxResults: 3,
  apiKey: "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",
});

// const searchInternet = createLangChainTools(rawSearchInternetTool)[0];
// const calculatorTool = createLangChainTools(calculator)[0];

// Define agents with exact roles, goals, and backgrounds from Python example
const citySelectorAgent = new Agent({
  name: "Peter Atlas",
  role: "City Selection Expert",
  goal: "Select the best city based on weather, season, and prices",
  background: "An expert in analyzing travel data to pick ideal destinations",
  type: "ReactChampionAgent",
  tools: [searchInternetTool],
  maxIterations: 20,
});

const localExpertAgent = new Agent({
  name: "Sophia Lore",
  role: "Local Expert at this city",
  goal: "Provide the BEST insights about the selected city",
  background: `A knowledgeable local guide with extensive information about the city, it's attractions and customs`,
  type: "ReactChampionAgent",
  tools: [searchInternetTool],
});

const travelConciergeAgent = new Agent({
  name: "Maxwell Journey",
  role: "Amazing Travel Concierge",
  goal: `Create the most amazing travel itineraries with budget and packing suggestions for the city`,
  background: `Specialist in travel planning and logistics with decades of experience`,
  type: "ReactChampionAgent",
  tools: [searchInternetTool],
});

// Define tasks with dynamic input placeholders
const identifyTask = new Task({
  description: `Analyze and select the best city for the trip based on 
    specific criteria such as weather patterns, seasonal events,
    and travel costs. ... 
    Origin: {origin}, City Options: {cities}, 
    Trip Date: {range}, 
    Traveler Interests: {interests}`,
  expectedOutput: `Detailed report on the chosen city,
     including flight costs, 
     weather forecast and attractions`,
  agent: citySelectorAgent,
});

const gatherTask = new Task({
  description: `Compile an in-depth guide for the selected city, 
    considering key attractions, local customs, and special events.
     ... Trip Date: {range}, Origin: {origin}, Interests: {interests}`,
  expectedOutput: `A comprehensive city guide,
     rich in cultural insights and practical tips`,
  agent: localExpertAgent,
});

const planTask = new Task({
  description: `Develop a full 7-day travel itinerary 
    with detailed daily plans, including places to eat, 
    packing suggestions, and a budget breakdown. ... 
    Trip Date: {range}, Origin: {origin}, Interests: {interests}`,
  expectedOutput: "A complete expanded travel plan formatted as markdown",
  agent: travelConciergeAgent,
});

// Team to coordinate the agents, with dynamic inputs
const team = new Team({
  name: "Trip Planning Team",
  agents: [citySelectorAgent, localExpertAgent, travelConciergeAgent],
  tasks: [identifyTask, gatherTask, planTask],
  logLevel: "error",
  inputs: {
    origin: "New York",
    cities: ["Tokyo", "Paris", "Berlin"],
    interests: "Art and Culture",
    range: "2024-12-01 to 2024-12-15",
  }, // Actual dynamic inputs
  env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY }, // Environment variables for the team,
});

module.exports = team;
