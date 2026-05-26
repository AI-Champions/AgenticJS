# Perplexity Search Tool

This tool integrates KaibanJS agents with the [Perplexity Search API](https://docs.perplexity.ai/api-reference/search-post), a web search API that returns ranked results (title, URL, snippet, and optional publication date) suitable for grounding LLM agents in fresh, citation-friendly content.

## Components

- A `Bearer` API key for authentication (`PERPLEXITY_API_KEY` or `PPLX_API_KEY`)
- A custom HTTP client (ky) for making API requests
- Input validation using Zod schema
- Configurable maximum results, domain filter, and recency filter

## Key Features

- Returns structured search results: `{ title, url, snippet, date? }`
- Configurable `maxResults` (default `10`)
- Optional `searchDomainFilter` — allow or deny list (use `-domain.com` to deny). Do not mix allow and deny entries.
- Optional `searchRecencyFilter` — `hour | day | week | month | year`
- Built-in error handling for HTTP and network errors

## Input

The input is a JSON object with a `searchQuery` field containing the query string.

## Output

A JSON-formatted string containing an array of search result objects.

## Example

```javascript
import { PerplexitySearch } from '@kaibanjs/tools';

const tool = new PerplexitySearch({
  apiKey: process.env.PERPLEXITY_API_KEY, // or set PERPLEXITY_API_KEY / PPLX_API_KEY
  maxResults: 5,
  searchRecencyFilter: 'week',
});

const result = await tool._call({
  searchQuery: 'What are the latest developments in AI?',
});

const results = JSON.parse(result);
results.forEach((r, i) => console.log(`${i + 1}. ${r.title} — ${r.url}`));
```

## Domain Filter Example

```javascript
const tool = new PerplexitySearch({
  apiKey: process.env.PERPLEXITY_API_KEY,
  searchDomainFilter: ['nytimes.com', 'reuters.com'], // allow-list
  // or: ['-pinterest.com', '-quora.com'] // deny-list — do not mix the two
});
```

## Get an API Key

Create a key at <https://www.perplexity.ai/account/api/keys>.

## Reference

- API reference: <https://docs.perplexity.ai/api-reference/search-post>
- Domain filter docs: <https://docs.perplexity.ai/docs/search/filters/domain-filter>
- Date / recency filter docs: <https://docs.perplexity.ai/docs/search/filters/date-time-filters>
