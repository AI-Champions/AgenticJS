# You.com Search Tool

This tool integrates with the You.com Search API (https://you.com/platform), a web search API built for LLM and agent workloads. It returns ranked web results with titles, URLs, and query-relevant snippets, so agents can ground their answers in current web sources.

## Components

The tool uses the following components:

- A You.com Search API client instance
- An API Key for authentication
- A custom HTTP client (ky) for making API requests
- Input validation using Zod schema

## Key Features

- Ranked web results with title, URL, and description
- Configurable result count (`numResults`, default 5)
- Optional freshness filter for recent windows (news, releases, prices)
- News results included when relevant

## Input

The input should be a JSON object with a `searchQuery` field containing the search query to process.

## Output

The output is a JSON array of web results, each with `title`, `url`, and `description` fields.

## Setup

Get an API key at https://you.com/platform/api-keys.

```javascript
import { YouSearch } from '@kaibanjs/tools';

const youSearch = new YouSearch({
  apiKey: 'your-api-key',
  numResults: 5, // optional, default 5
  freshness: 'week', // optional: limit to recent results
});
```

Then attach the tool to an agent:

```javascript
const researchAgent = new Agent({
  name: 'Insight',
  role: 'Research Analyst',
  goal: 'Find and cite current information from the web.',
  background: 'Web research specialist.',
  tools: [youSearch],
});
```
