# Kaiban Tools for AI Agents

This package provides a collection of specialized tools designed for use with AI agents, enhancing their capabilities for various tasks.

## Purpose

The Kaiban Tools package offers a set of tools that can be integrated into AI agent systems, allowing agents to perform a wide range of tasks more effectively. These tools are designed to extend the capabilities of AI agents, enabling them to interact with external services, process data, and perform complex operations.

## Features

- A collection of tools specifically designed for AI agents
- Easy integration with existing agent frameworks and architectures
- Tools for various purposes, including web scraping, data transformation, and more
- Configurable options for each tool to suit different agent requirements

## Installation

```bash
npm install @kaibanjs/tools
```

## Available Tools

Here's a list of all available tools. Click on the tool names to view their detailed documentation.

> **Recommended for general web search:** `PerplexitySearch` — single API key, snippets pre-ranked for LLM grounding, with domain and recency filters. Set `PERPLEXITY_API_KEY` (or `PPLX_API_KEY`) and you're done.

| Tool                          | Description                                                                     | Documentation                                |
| ----------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------- |
| Perplexity Search (recommended) | Web search via the Perplexity Search API with domain and recency filters        | [README](src/perplexity-search/README.md)    |
| Exa                           | AI-focused search engine using embeddings to organize web data                  | [README](src/exa/README.md)                  |
| Firecrawl                     | Web scraping service for extracting structured data                             | [README](src/firecrawl/README.md)            |
| GitHub Issues                 | GitHub API integration for fetching and analyzing repository issues             | [README](src/github-issues/README.md)        |
| Jina URL to MD                | Convert web content into clean, LLM-ready markdown using Jina.ai                | [README](src/jina-url-to-markdown/README.md) |
| PDF Search                    | Extract and search content from PDF documents                                   | [README](src/pdf-search/README.md)           |
| Serper                        | Google Search API integration with support for multiple search types            | [README](src/serper/README.md)               |
| Simple RAG                    | Basic Retrieval-Augmented Generation implementation for Q&A                     | [README](src/simple-rag/README.md)           |
| Tavily Search                 | AI-optimized search engine for comprehensive and accurate results               | [README](src/tavily/README.md)               |
| Text File Search              | Search and analyze content within text files                                    | [README](src/textfile-search/README.md)      |
| Website Search                | Semantic search within website content using RAG models                         | [README](src/website-search/README.md)       |
| WolframAlpha                  | Computational intelligence engine for complex queries and calculations          | [README](src/wolfram-alpha/README.md)        |
| Zapier Webhook                | Integration with Zapier for workflow automation                                 | [README](src/zapier-webhook/README.md)       |
| Make Webhook                  | Integration with Make (formerly Integromat) for workflow automation             | [README](src/make-webhook/README.md)         |
| Simple RAG Retrieve           | Basic Retrieval-Augmented Generation implementation for Q&A with preloaded data | [README](src/simple-rag-retrieve/README.md)  |

## Development

### Local Setup

1. Clone the repository:

```bash
git clone https://github.com/kaiban-ai/KaibanJS.git
```

2. Install KaibanJS dependencies:

```bash
npm install
```

3. Build the package:

```bash
npm run build
```

3. Navigate to the tools package:

```bash
cd packages/tools
```

3. Install dependencies:

```bash
npm install
```

4. Environment Variables:

Create a `.env` file in the root directory with your API keys:

```env
VITE_FIRECRAWL_API_KEY=your_firecrawl_api_key
VITE_TAVILY_API_KEY=your_tavily_api_key
VITE_SERPER_API_KEY=your_serper_api_key
VITE_EXA_API_KEY=your_exa_api_key
VITE_WOLFRAM_APP_ID=your_wolfram_app_id
```

5. Run Storybook to view and test components:

```bash
npm run storybook
```

6. Build the package:

```bash
npm run build
```

7. Run tests:

```bash
npm run test
```

## Contributing

To contribute a new tool:

1. Follow the Development steps above to set up your local environment
2. Use an existing tool as reference (check `src/firecrawl` or `src/tavily` for examples)
3. Remember to create:
   - Your tool implementation
   - A Storybook story
   - Tests

For questions or discussions, join our [Discord](https://kaibanjs.com/discord).

## License

MIT License
