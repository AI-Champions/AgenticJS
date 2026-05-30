/**
 * Exa Search Tool
 *
 * This tool integrates with Exa (https://exa.ai/), a search engine for AI that organizes
 * the web using embeddings. It provides high-quality web data specifically optimized
 * for AI applications.
 *
 * Key features:
 * - Auto Search: Dynamically chooses the best search mode (default)
 * - Neural Search: Meaning-based search using embeddings
 * - Keyword Search: Traditional search capabilities
 * - Fast Search: Optimized for speed
 * - Deep Search: Thorough search for comprehensive results
 * - Instant Search: Near real-time results
 * - Category-focused search
 * - Domain filtering
 * - Date filtering
 * - Text filtering
 */

import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import ky, { HTTPError } from 'ky';

const API_BASE_URL = 'https://api.exa.ai';

/**
 * Structure of an individual search result from Exa
 * @example
 * {
 *   title: "Example Article",
 *   url: "https://example.com/article",
 *   snippet: "This is a sample search result...",
 *   publishedDate: "2024-03-20",
 *   author: "John Doe"
 * }
 */
type ExaSearchToolResult = {
  title: string;
  url: string;
  snippet: string;
  publishedDate: string;
  author: string;
};

/** Error message returned when the search fails */
type ExaSearchToolError = string;

/**
 * Response structure from the Exa search API
 * @example
 * {
 *   results: [{
 *     title: "Example Article",
 *     url: "https://example.com/article",
 *     snippet: "This is a sample search result...",
 *     publishedDate: "2024-03-20",
 *     author: "John Doe"
 *   }]
 * }
 */
type ExaSearchToolResponse =
  | {
      [key: string]: any;
      results: ExaSearchToolResult[];
    }
  | ExaSearchToolError;

/**
 * Type of search to perform
 * - neural: Semantic search using embeddings
 * - keyword: Traditional keyword-based search
 * - auto: Automatically choose between neural and keyword
 */
type ExaSearchToolType = 'neural' | 'keyword' | 'auto' | 'fast' | 'deep' | 'instant';

/**
 * Categories that can be used to filter search results
 */
type ExaSearchToolCategory =
  | 'company'
  | 'research paper'
  | 'news'
  | 'github'
  | 'tweet'
  | 'movie'
  | 'song'
  | 'personal site'
  | 'pdf';

/**
 * Live crawling behavior options
 * - never: Never perform live crawling
 * - fallback: Only crawl if cached version isn't available
 * - always: Always perform a fresh crawl
 */
type ExaLiveCrawl = 'never' | 'fallback' | 'always';

/**
 * Configuration for content extraction and processing
 * @example
 * {
 *   text: { maxCharacters: 1000, includeHtmlTags: false },
 *   highlights: { numSentences: 3, highlightsPerUrl: 2, query: "AI technology" },
 *   summary: { query: "What are the main points?" },
 *   subpages: 5,
 *   livecrawl: "fallback"
 * }
 */
interface ExaContentConfig {
  text?:
    | {
        maxCharacters: number;
        includeHtmlTags: boolean;
      }
    | boolean;
  highlights?: {
    numSentences: number;
    highlightsPerUrl: number;
    query: string;
  };
  summary?:
    | {
        query: string;
      }
    | boolean;
  subpages?: number;
  subpageTarget?: number;
  livecrawl?: ExaLiveCrawl;
  livecrawlTimeout?: number;
}

/**
 * Configuration options for initializing the Exa search tool
 * @example
 * {
 *   apiKey: "your-api-key",
 *   type: "neural",
 *   numResults: 5,
 *   category: "news",
 *   includeDomains: ["example.com"],
 *   startPublishedDate: "2024-01-01"
 * }
 */
interface ExaSearchToolFields {
  apiKey: string;
  type?: ExaSearchToolType;
  useAutoprompt?: boolean;
  numResults?: number;
  category?: ExaSearchToolCategory;
  startPublishedDate?: string;
  endPublishedDate?: string;
  includeDomains?: string[];
  excludeDomains?: string[];
  includeText?: string[];
  excludeText?: string[];
  startCrawlDate?: string;
  endCrawlDate?: string;
  contents?: ExaContentConfig;
}

/**
 * Parameters for performing a search query
 * @example
 * {
 *   query: "Latest developments in artificial intelligence"
 * }
 */
interface ExaSearchToolParams {
  query: string;
}

/** Combined type for all possible search parameters */
type ExaSearchToolParamsKeys = ExaSearchToolParams | ExaSearchToolFields;

/**
 * ExaSearch tool for performing AI-optimized web searches using the Exa API
 *
 * @example
 * ```typescript
 * const exaSearch = new ExaSearch({
 *   apiKey: 'your-api-key',
 *   type: 'neural',
 *   numResults: 5,
 *   category: 'news'
 * });
 *
 * const results = await exaSearch.call({ query: 'Latest AI developments' });
 * ```
 */
export class ExaSearch extends StructuredTool {
  private apiKey: string;
  private type: ExaSearchToolType;
  private useAutoprompt: boolean;
  private category?: ExaSearchToolCategory;
  private numResults: number;
  private includeDomains: string[];
  private excludeDomains: string[];
  private startCrawlDate?: string;
  private endCrawlDate?: string;
  private startPublishedDate?: string;
  private endPublishedDate?: string;
  private includeText: string[];
  private excludeText: string[];
  private contents?: ExaContentConfig;
  private httpClient: typeof ky;

  name = 'exa-search';
  description =
    'A powerful AI-optimized search engine that provides high-quality web data using embeddings-based search.';

  schema = z.object({
    query: z.string().describe('The search query to look up'),
  });

  /**
   * Creates a new instance of the ExaSearch tool
   *
   * @param fields - Configuration options for the search tool
   * @throws {Error} If an invalid search type is provided
   */
  constructor(fields: ExaSearchToolFields) {
    super();

    if (fields.type && !['neural', 'keyword', 'auto', 'fast', 'deep', 'instant'].includes(fields.type)) {
      throw new Error(
        'Invalid search type. Must be one of: neural, keyword, auto, fast, deep, instant'
      );
    }

    this.apiKey = fields.apiKey;
    console.log(this.apiKey);

    // Configuration parameters in order of API documentation
    this.type = fields.type || 'auto';
    this.useAutoprompt = fields.useAutoprompt || false;
    this.category = fields.category;
    this.numResults = fields.numResults || 10;
    this.includeDomains = fields.includeDomains || [];
    this.excludeDomains = fields.excludeDomains || [];
    this.startCrawlDate = fields.startCrawlDate;
    this.endCrawlDate = fields.endCrawlDate;
    this.startPublishedDate = fields.startPublishedDate;
    this.endPublishedDate = fields.endPublishedDate;
    this.includeText = fields.includeText || [];
    this.excludeText = fields.excludeText || [];
    this.contents = fields.contents;

    this.httpClient = ky.extend({
      prefixUrl: API_BASE_URL,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Performs a search using the Exa API
   *
   * @param input - The search parameters containing the query
   * @returns A promise that resolves to either search results or an error message
   *
   * @example
   * ```typescript
   * const results = await exaSearch._call({ query: 'AI technology trends' });
   * ```
   */
  async _call(input: ExaSearchToolParams): Promise<ExaSearchToolResponse> {
    try {
      const searchParams: ExaSearchToolParamsKeys = {
        query: input.query,
        type: this.type,
        useAutoprompt: this.useAutoprompt,
        category: this.category,
        numResults: this.numResults,
        includeDomains: this.includeDomains,
        excludeDomains: this.excludeDomains,
        startCrawlDate: this.startCrawlDate,
        endCrawlDate: this.endCrawlDate,
        startPublishedDate: this.startPublishedDate,
        endPublishedDate: this.endPublishedDate,
        includeText: this.includeText,
        excludeText: this.excludeText,
        contents: this.contents,
      };

      // Remove undefined and empty values
      Object.keys(searchParams).forEach((key) => {
        if (
          searchParams[key as keyof ExaSearchToolParamsKeys] === undefined ||
          (Array.isArray(searchParams[key as keyof ExaSearchToolParamsKeys]) &&
            (searchParams[key as keyof ExaSearchToolParamsKeys] as unknown[])
              .length === 0)
        ) {
          delete searchParams[key as keyof ExaSearchToolParamsKeys];
        }
      });

      const response = await this.httpClient
        .post('search', {
          json: searchParams,
        })
        .json();

      return response as ExaSearchToolResponse;
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
