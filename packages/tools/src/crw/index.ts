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
 * For more information about fastCRW, visit: https://fastcrw.com/
 */

import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import ky, { HTTPError } from 'ky';

/** Default fastCRW cloud API base URL */
const DEFAULT_API_URL = 'https://fastcrw.com/api';

/**
 * Configuration options for initializing the fastCRW tool
 * @example
 * {
 *   apiKey: "your-api-key",
 *   format: "markdown"
 * }
 */
interface CrwToolFields {
  apiKey: string;
  format?: string;
  apiUrl?: string;
}

/**
 * Parameters for making a scraping request
 * @example
 * {
 *   url: "https://example.com/article",
 *   format: "markdown",
 *   mode: "scrape"
 * }
 */
interface CrwToolParams {
  url: string;
  format?: string;
  mode?: string;
}

/** The scraped content returned as a string */
type CrwToolResponse = string;

/** Error message returned when the scraping fails */
type CrwToolError = string;

/**
 * fastCRW tool for scraping web content and converting it to LLM-ready formats
 *
 * @example
 * ```typescript
 * const crw = new Crw({
 *   apiKey: 'your-api-key',
 *   format: 'markdown'
 * });
 *
 * const content = await crw.call({
 *   url: 'https://example.com/article'
 * });
 * ```
 */
export class Crw extends StructuredTool {
  private apiKey: string;
  private format: string;
  private mode: string;
  private apiUrl: string;
  private httpClient: typeof ky;
  name = 'crw';
  description: string;
  schema = z.object({
    url: z.string().describe('The URL to scrape and retrieve content from.'),
  });

  /**
   * Creates a new instance of the fastCRW tool
   *
   * @param fields - Configuration options for the scraping tool
   */
  constructor(fields: CrwToolFields) {
    super();

    this.apiKey = fields.apiKey;
    this.format = fields.format || 'markdown';
    this.mode = 'scrape';
    this.apiUrl = fields.apiUrl || DEFAULT_API_URL;
    this.description = `Fetches web content from a specified URL and returns it in ${this.format} format. Input should be a JSON object with a "url".`;
    this.httpClient = ky;
  }

  /**
   * Scrapes content from a URL using the fastCRW API
   *
   * @param input - The parameters containing the URL to scrape
   * @returns A promise that resolves to either the scraped content or an error message
   *
   * @example
   * ```typescript
   * const content = await crw._call({
   *   url: 'https://example.com/article'
   * });
   * ```
   */
  async _call(input: CrwToolParams): Promise<CrwToolResponse | CrwToolError> {
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
        .json<{ data?: { [key: string]: string } }>();

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
        return `An unexpected error occurred: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    }
  }
}
