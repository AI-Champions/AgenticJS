const { Agent, Task, Team } = require("kaibanjs");

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

// Define tools
const searchInternet = new TavilySearchResults({
  maxResults: 3,
  // apiKey: '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',
  apiKey: "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",
});

// Define agents with exact roles, goals, and backgrounds from Python example
const citySelectorAgent = new Agent({
  name: "Peter Atlas",
  role: "City Selection Expert",
  goal: "Select the best city based on weather, season, and prices",
  background: "An expert in analyzing travel data to pick ideal destinations",
  type: "ReactChampionAgent",
  tools: [searchInternet],
  maxIterations: 20,
  llmConfig: {
    provider: "openai",
    model: "gpt-4o-mini",
    // model: "gpt-4o",
    // model: "gpt-3.5-turbo-0125",
    // model: "gpt-4-turbo",
  },
});

const localExpertAgent = new Agent({
  name: "Sophia Lore",
  role: "Local Expert at this city",
  goal: "Provide the BEST insights about the selected city",
  background: `A knowledgeable local guide with extensive information about the city, it's attractions and customs`,
  type: "ReactChampionAgent",
  tools: [searchInternet],
  maxIterations: 5,
  llmConfig: {
    provider: "openai",
    model: "gpt-4o-mini",
  },
});

const travelConciergeAgent = new Agent({
  name: "Maxwell Journey",
  role: "Amazing Travel Concierge",
  goal: `Create the most amazing travel itineraries with budget and packing suggestions for the city`,
  background: `Specialist in travel planning and logistics with decades of experience`,
  type: "ReactChampionAgent",
  tools: [searchInternet],
  maxIterations: 5,
  llmConfig: {
    provider: "openai",
    model: "gpt-4o-mini",
  },
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
const tripPlanningTeam = new Team({
  name: "Trip Planning Team",
  agents: [citySelectorAgent, localExpertAgent, travelConciergeAgent],
  tasks: [identifyTask, gatherTask, planTask],
  logLevel: "info",
  inputs: {
    origin: "New York",
    cities: ["Tokyo", "Paris", "Berlin"],
    interests: "Art and Culture",
    range: "2024-12-01 to 2024-12-15",
  }, // Actual dynamic inputs
  env: {
    OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
    ANTHROPIC_API_KEY: import.meta.env.VITE_ANTHROPIC_API_KEY,
  },
});

export default tripPlanningTeam;
