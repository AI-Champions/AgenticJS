# fastCRW Tool

This tool integrates with fastCRW (https://fastcrw.com/), a Firecrawl-compatible web scraping and crawling engine packaged as a single small Rust binary. It enables the extraction of clean, well-formatted content from websites, making it ideal for AI applications, particularly those using Large Language Models (LLMs). fastCRW can be self-hosted (free, AGPL open core) or used via the managed cloud at https://fastcrw.com.

## Components

The tool uses the following components:

- A fastCRW API client instance
- An API Key for authentication (optional when self-hosting without auth)
- A configurable API base URL (cloud by default, override for self-host)
- A custom HTTP client (ky) for making API requests
- Input validation using Zod schema
- Configurable output format

## Key Features

- Firecrawl-compatible web scraper; single binary; self-host or cloud
- Scrapes and crawls websites, even those with dynamic content
- Converts web content into clean, LLM-ready markdown
- Handles complex web scraping challenges:
  - JavaScript rendering
  - Anti-bot mechanisms
- Multiple output format options
- Clean, structured data extraction
- Support for dynamic content
- Automatic content cleaning and formatting

## Input

The input should be a JSON object with a "url" field containing the URL to scrape and retrieve content from.

## Output

The output is the scraped content from the specified URL, formatted according to the configured format (default: markdown).

## Configuration Options

- `apiKey`: Your fastCRW API key (read from `CRW_API_KEY` by convention)
- `apiUrl`: API base URL (defaults to `https://fastcrw.com/api`; override for self-host, e.g. `http://localhost:3000`)
- `format`: Output format (defaults to 'markdown')
- `mode`: Scraping mode (currently supports 'scrape')

## Example

```javascript
const tool = new Crw({
  apiKey: 'your-api-key',
  format: 'markdown',
});

const result = await tool._call({
  url: 'https://example.com',
});
```

## Self-Hosted Example

```javascript
const tool = new Crw({
  apiKey: process.env.CRW_API_KEY,
  apiUrl: 'http://localhost:3000',
  format: 'markdown',
});

const result = await tool._call({
  url: 'https://example.com',
});
```

## Advanced Example with Error Handling

```javascript
const tool = new Crw({
  apiKey: process.env.CRW_API_KEY,
  format: 'markdown',
});

try {
  const result = await tool._call({
    url: 'https://example.com/blog/article',
  });

  // Process the scraped content
  console.log('Scraped content:', result);

  // Use the content with an LLM or other processing
  // ...
} catch (error) {
  console.error('Error scraping website:', error);
}
```

### Disclaimer

Ensure you have proper API credentials and respect fastCRW's usage terms. When scraping websites, make sure to comply with the target website's terms of service and robots.txt directives.
