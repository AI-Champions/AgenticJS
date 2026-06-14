import { ToolPreviewer } from '../_utils/ToolPreviewer.jsx';
import { AgentWithToolPreviewer } from '../_utils/AgentWithToolPreviewer.jsx';
import { Crw } from './index.ts';
import { Agent, Task, Team } from '../../../../';
import React from 'react';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: 'Tools/Crw',
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    // backgroundColor: { control: 'color' },
    // url: { control: 'text' },
    // apiKey: { control: 'text' },
    // format: { control: 'select', options: ['markdown', 'json']},
    // initializationCode: { table: { disable: true } },
    // executionCode: { table: { disable: true } }
  },
};

const crwTool = new Crw({
  apiKey: import.meta.env.VITE_CRW_API_KEY,
  format: 'markdown',
});

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default = {
  render: (args) => <ToolPreviewer {...args} />,
  args: {
    toolInstance: crwTool,
    callParams: {
      url: 'https://www.google.com',
    },
  },
};

// Create an agent with the crw tool
const webResearcher = new Agent({
  name: 'Web Researcher',
  role: 'Web Content Analyzer',
  goal: 'Extract and analyze content from specified websites',
  tools: [crwTool],
});

// Create a research task
const webAnalysisTask = new Task({
  description:
    'Fetches web content from the following URL: {url} and provides a structured summary',
  agent: webResearcher,
  expectedOutput: 'A well-formatted analysis of the website content',
});

// Create the team
const team = new Team({
  name: 'Web Analysis Unit',
  description: 'Specialized team for web content extraction and analysis',
  agents: [webResearcher],
  tasks: [webAnalysisTask],
  inputs: {
    url: 'https://www.kaibanjs.com',
  },
  env: {
    OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
  },
});

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const withAgent = {
  render: (args) => <AgentWithToolPreviewer {...args} />,
  args: {
    team: team,
  },
};
