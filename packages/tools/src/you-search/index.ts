/**
 * You.com Search Tool
 *
 * This tool integrates with the You.com Search API (https://you.com/platform),
 * a web search API that returns ranked results with titles, URLs, and
 * query-relevant snippets, built for LLM and agent workloads.
 *
 * Key features:
 * - Ranked web results with title, URL, and description for each hit
 * - Optional result count configuration
 * - Optional freshness filter for recent windows (news, releases, prices)
 * - News results included when relevant
 */

import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import ky, { HTTPError } from 'ky';

const API_BASE_URL = 'https://api.you.com';

/**
 * Structure of an individual web result from You.com
 * @example
 * {
 *   title: "Example Article",
 *   url: "https://example.com/article",
 *   description: "This is a sample search result...",
 * }
 */
type YouSearchResult = {
  title: string;
  url: string;
  description: string;
  [key: string]: any;
};

/** Error message returned when the search fails */
type YouSearchError = string;

/**
 * Response structure from the You.com search API
 * @example
 * {
 *   results: {
 *     web: [{ title, url, description }],
 *     news: [{ title, url, description }]
 *   }
 * }
 */
type YouSearchResponse =
  | {
      results: {
        web: YouSearchResult[];
        news: YouSearchResult[];
      };
    }
  | YouSearchError;

/**
 * Configuration options for initializing the You.com search tool
 * @example
 * {
 *   apiKey: "your-api-key",
 *   numResults: 5,
 *   freshness: "week"
 * }
 */
interface YouSearchToolFields {
  apiKey: string;
  numResults?: number;
  freshness?: string;
}

/**
 * Parameters for performing a search query
 * @example
 * {
 *   searchQuery: "Latest developments in artificial intelligence"
 * }
 */
interface YouSearchToolParams {
  searchQuery: string;
}

/** Parameters accepted by the underlying You.com search endpoint */
type YouSearchToolEndpointParams = {
  query: string;
  numResults: number;
  freshness?: string;
};

/**
 * YouSearch tool for performing web searches using the You.com Search API
 *
 * @example
 * ```typescript
 * const youSearch = new YouSearch({
 *   apiKey: 'your-api-key',
 *   numResults: 5,
 * });
 *
 * const results = await youSearch.call({ searchQuery: 'Latest AI developments' });
 * ```
 */
export class YouSearch extends StructuredTool {
  private apiKey: string;
  private numResults: number;
  private freshness?: string;
  private httpClient: typeof ky;

  name = 'you_search_results_json';
  description =
    'A search engine for agent research that returns ranked web results with titles, URLs, and snippets. Useful when an agent needs current information, facts about people, companies, or recent events. Input should be a search query.';

  schema = z.object({
    searchQuery: z
      .string()
      .describe('The search query to find relevant information.'),
  });

  /**
   * Creates a new instance of the YouSearch tool
   *
   * @param fields - Configuration options for the search tool
   */
  constructor(fields: YouSearchToolFields) {
    super();

    this.apiKey = fields.apiKey;
    this.numResults = fields.numResults ?? 5;
    this.freshness = fields.freshness;

    this.httpClient = ky.extend({
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Performs a search using the You.com Search API
   *
   * @param input - The search parameters containing the query
   * @returns A promise that resolves to either search results or an error message
   *
   * @example
   * ```typescript
   * const results = await youSearch._call({ searchQuery: 'AI technology trends' });
   * ```
   */
  async _call(input: YouSearchToolParams): Promise<YouSearchResponse> {
    try {
      const searchParams: YouSearchToolEndpointParams = {
        query: input.searchQuery,
        numResults: this.numResults,
      };
      if (this.freshness) {
        searchParams.freshness = this.freshness;
      }

      const jsonData = await this.httpClient
        .post(`${API_BASE_URL}/api/search`, {
          json: searchParams,
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .json<YouSearchResponse>();

      const webResults = (jsonData as any)?.results?.web;
      if (!Array.isArray(webResults)) {
        return 'Could not parse You.com results. Please try again.';
      }

      return JSON.stringify(webResults);
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
