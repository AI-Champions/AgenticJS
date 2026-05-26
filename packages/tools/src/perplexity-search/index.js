/**
 * Perplexity Search
 *
 * This tool integrates with the Perplexity Search API
 * (https://docs.perplexity.ai/api-reference/search-post), a web search API
 * that returns ranked search results (title, URL, snippet, optional date)
 * suitable for grounding LLM agents in fresh, citation-friendly web content.
 *
 * Key features:
 * - Configurable maximum number of results
 * - Optional domain allow / deny filter (use a leading "-" to deny)
 * - Optional recency filter (hour | day | week | month | year)
 * - Returns structured results: { title, url, snippet, date? }
 *
 * Auth: pass `apiKey` directly, or set `PERPLEXITY_API_KEY` (or `PPLX_API_KEY`)
 * in the environment. Get an API key at https://www.perplexity.ai/account/api/keys.
 *
 * Usage:
 * const tool = new PerplexitySearch({
 *   apiKey: 'your-api-key',
 *   maxResults: 5,
 *   searchRecencyFilter: 'week',
 * });
 * const json = await tool._call({ searchQuery: 'latest AI breakthroughs' });
 * const results = JSON.parse(json);
 */

import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import ky from 'ky';
import { HTTPError } from 'ky';
import packageJson from '../../package.json';

const API_URL = 'https://api.perplexity.ai/search';
const INTEGRATION_HEADER = `kaibanjs/${packageJson.version}`;

export class PerplexitySearch extends Tool {
  constructor(fields = {}) {
    super(fields);

    const apiKey =
      fields.apiKey ||
      (typeof process !== 'undefined' && process.env
        ? process.env.PERPLEXITY_API_KEY || process.env.PPLX_API_KEY
        : undefined);

    if (!apiKey) {
      throw new Error(
        'PerplexitySearch: missing API key. Pass `apiKey` or set PERPLEXITY_API_KEY (or PPLX_API_KEY) in the environment.'
      );
    }

    this.apiKey = apiKey;
    this.maxResults = fields.maxResults ?? 10;
    this.searchDomainFilter = fields.searchDomainFilter;
    this.searchRecencyFilter = fields.searchRecencyFilter;

    this.name = 'perplexity-search';
    this.description =
      'A web search tool powered by the Perplexity Search API. Returns ranked search results with title, URL, snippet, and optional publication date. Useful for retrieving fresh, citation-friendly information about current events, research, or any topic that benefits from up-to-date web sources. Input should be a search query.';

    this.httpClient = ky;
    this.schema = z.object({
      searchQuery: z
        .string()
        .describe('The search query to send to the Perplexity Search API.'),
    });
  }

  async _call(input) {
    const body = {
      query: input.searchQuery,
      max_results: this.maxResults,
    };

    if (this.searchDomainFilter && this.searchDomainFilter.length > 0) {
      body.search_domain_filter = this.searchDomainFilter;
    }
    if (this.searchRecencyFilter) {
      body.search_recency_filter = this.searchRecencyFilter;
    }

    try {
      const json = await this.httpClient
        .post(API_URL, {
          json: body,
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-Pplx-Integration': INTEGRATION_HEADER,
          },
        })
        .json();

      const results = json?.results;
      if (!Array.isArray(results)) {
        return 'Could not parse Perplexity search results. Please try again.';
      }

      const normalized = results.map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet,
        ...(r.date ? { date: r.date } : {}),
      }));

      return JSON.stringify(normalized);
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
      }
      return `An unexpected error occurred: ${error.message}`;
    }
  }
}
