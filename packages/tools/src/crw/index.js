/**
 * fastCRW
 *
 * This tool integrates with fastCRW (https://fastcrw.com/), a Firecrawl-compatible
 * web scraping and crawling engine packaged as a single small Rust binary.
 *
 * fastCRW turns websites into LLM-ready data. It extracts clean, well-formatted
 * markdown or structured data from websites, making it ideal for AI applications,
 * particularly those using Large Language Models (LLMs).
 *
 * Key features of fastCRW:
 * - Firecrawl-compatible web scraper; single binary; self-host or cloud
 * - Scrapes and crawls websites, even those with dynamic content
 * - Converts web content into clean, LLM-ready markdown
 * - Handles challenges like JavaScript rendering and anti-bot mechanisms
 * - Self-host (free, AGPL open core) or managed cloud at https://fastcrw.com
 *
 * Usage:
 * const tool = new Crw({ apiKey: 'your-api-key' });
 * const result = await tool._call({ url: 'https://example.com' });
 *
 * For more information about fastCRW, visit: https://fastcrw.com/
 */

import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import ky from 'ky';
import { HTTPError } from 'ky';

/** Default fastCRW cloud API base URL */
const DEFAULT_API_URL = 'https://fastcrw.com/api';

export class Crw extends Tool {
  constructor(fields) {
    super(fields);
    this.name = 'crw';
    this.apiKey = fields.apiKey;
    this.format = fields.format || 'markdown';
    this.mode = 'scrape';
    this.apiUrl = fields.apiUrl || DEFAULT_API_URL;
    this.description = `Fetches web content from a specified URL and returns it in ${this.format} format. Input should be a JSON object with a "url".`;

    // Define the input schema using Zod
    this.schema = z.object({
      url: z.string().describe('The URL to scrape and retrieve content from.'),
    });

    this.httpClient = ky;
  }

  async _call(input) {
    try {
      const response = await this.httpClient
        .post(`${this.apiUrl}/v1/scrape`, {
          json: {
            url: input.url,
            formats: [this.format],
          },
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        })
        .json();

      return (
        response?.data?.[this.format] || 'The API returned an empty response.'
      );
    } catch (error) {
      if (error instanceof HTTPError) {
        const statusCode = error.response.status;
        let errorType = 'Unknown';
        if (statusCode >= 400 && statusCode < 500) {
          errorType = 'Client Error';
        } else if (statusCode >= 500) {
          errorType = 'Server Error';
        }
        return `API request failed: ${errorType} (${statusCode})`;
      } else {
        return `An unexpected error occurred: ${error.message}`;
      }
    }
  }
}
