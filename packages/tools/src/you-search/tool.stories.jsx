import { ToolPreviewer } from '../_utils/ToolPreviewer.jsx';
import { YouSearch } from './index.ts';
import { Agent, Task, Team } from '../../../../';
import React from 'react';
import { AgentWithToolPreviewer } from '../_utils/AgentWithToolPreviewer.jsx';

export default {
  title: 'Tools/YouSearch',
  component: ToolPreviewer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

const youTool = new YouSearch({
  apiKey: import.meta.env.VITE_YOU_API_KEY,
  numResults: 5,
});

// Create an agent with the you.com search tool
const researchAgent = new Agent({
  name: 'Insight',
  role: 'Research Analyst',
  goal: 'Provide comprehensive research and analysis on specific topics using high-quality sources.',
  background:
    'Web research specialist with a focus on current events and factual verification.',
  tools: [youTool],
});

const researchTask = new Task({
  description: `Research the latest developments in multi-agent frameworks and provide a summary with sources.`,
  expectedOutput: 'A concise summary with cited sources.',
  agent: researchAgent,
});

const team = new Team({
  name: 'Research Team',
  agents: [researchAgent],
  tasks: [researchTask],
  inputs: {},
});

export const Default = {
  render: () => (
    <AgentWithToolPreviewer
      agent={researchAgent}
      tool={youTool}
      task={researchTask}
    />
  ),
};
