import { ToolPreviewer } from '../_utils/ToolPreviewer.jsx';
import { PerplexitySearch } from './index.ts';
import { Agent, Task, Team } from '../../../../';
import React from 'react';
import { AgentWithToolPreviewer } from '../_utils/AgentWithToolPreviewer.jsx';

export default {
  title: 'Tools/PerplexitySearch',
  component: ToolPreviewer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

const perplexityTool = new PerplexitySearch({
  apiKey: import.meta.env.VITE_PERPLEXITY_API_KEY,
  maxResults: 5,
});

const searchResearcher = new Agent({
  name: 'Search Researcher',
  role: 'Web Search Analyzer',
  goal: 'Perform web searches and analyze the results',
  tools: [perplexityTool],
  maxIterations: 5,
  llmConfig: {
    provider: 'google',
    model: 'gemini-1.5-pro',
  },
});

const searchAnalysisTask = new Task({
  description:
    'Performs a web search for: {searchQuery} and provides a structured summary',
  agent: searchResearcher,
  expectedOutput: 'A well-formatted analysis of the search results',
});

const team = new Team({
  name: 'Search Analysis Unit',
  description: 'Specialized team for web search and analysis',
  agents: [searchResearcher],
  tasks: [searchAnalysisTask],
  inputs: {
    searchQuery: 'What are the latest developments in AI?',
  },
  env: {
    OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
    GOOGLE_API_KEY: import.meta.env.VITE_GOOGLE_API_KEY,
  },
});

export const Default = {
  args: {
    toolInstance: perplexityTool,
    callParams: {
      searchQuery: 'What are the latest developments in AI?',
    },
  },
};

export const withAgent = {
  render: (args) => <AgentWithToolPreviewer {...args} />,
  args: {
    team: team,
  },
};
