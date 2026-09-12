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
 *
 * Usage:
 * const tool = new YouSearch({
 *   apiKey: 'your-api-key',
 *   numResults: 5,
 *   freshness: 'week'
 * });
 * const results = await tool._call({ searchQuery: 'Latest AI developments' });
 *
 * For more information about You.com, visit: https://you.com/platform
 */

import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import ky from 'ky';
import { HTTPError } from 'ky';

export class YouSearch extends Tool {
  constructor(fields) {
    super(fields);
    this.apiKey = fields.apiKey;
    this.numResults = fields.numResults ?? 5;
    this.freshness = fields.freshness;
    this.name = 'you_search_results_json';
    this.description =
      'A search engine for agent research that returns ranked web results with titles, URLs, and snippets. Useful when an agent needs current information, facts about people, companies, or recent events. Input should be a search query.';

    this.httpClient = ky.extend({
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });
    // Define the input schema using Zod
    this.schema = z.object({
      searchQuery: z
        .string()
        .describe('The search query to find relevant information.'),
    });
  }

  async _call(input) {
    try {
      const searchParams = {
        query: input.searchQuery,
        numResults: this.numResults,
      };
      if (this.freshness) {
        searchParams.freshness = this.freshness;
      }

      const jsonData = await this.httpClient
        .post('https://api.you.com/api/search', {
          json: searchParams,
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .json();

      // Extract and validate the web results from the response
      const webResults = jsonData?.results?.web;
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
        return `An unexpected error occurred: ${error.message}`;
      }
    }
  }
}
