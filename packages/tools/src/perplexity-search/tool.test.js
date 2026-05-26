const {
  PerplexitySearch,
} = require('../../dist/perplexity-search/index.cjs.js');
const { version: packageVersion } = require('../../package.json');

describe('PerplexitySearch', () => {
  const sampleResults = [
    {
      title: 'Latest AI News',
      url: 'https://example.com/ai-news',
      snippet: 'Recent developments in artificial intelligence...',
      date: '2026-04-01',
    },
    {
      title: 'AI in Healthcare',
      url: 'https://example.com/ai-healthcare',
      snippet: 'How AI is transforming healthcare...',
    },
  ];

  test('sends correct default parameters and normalizes results', async () => {
    const tool = new PerplexitySearch({ apiKey: 'test-api-key' });

    let capturedRequest;
    tool.httpClient = tool.httpClient.extend({
      hooks: {
        beforeRequest: [
          (request) => {
            capturedRequest = request;
            return new Response(
              JSON.stringify({ id: 'abc', results: sampleResults }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          },
        ],
      },
    });

    const result = await tool._call({ searchQuery: 'latest AI developments' });

    expect(capturedRequest.url).toBe('https://api.perplexity.ai/search');
    expect(capturedRequest.method).toBe('POST');
    expect(capturedRequest.headers.get('Authorization')).toBe(
      'Bearer test-api-key'
    );
    expect(capturedRequest.headers.get('Content-Type')).toBe(
      'application/json'
    );
    const integrationHeader = capturedRequest.headers.get(
      'X-Pplx-Integration'
    );
    expect(integrationHeader).toBe(`kaibanjs/${packageVersion}`);
    expect(integrationHeader).toMatch(/^kaibanjs\//);

    const body = await capturedRequest.json();
    expect(body).toEqual({
      query: 'latest AI developments',
      max_results: 10,
    });

    const parsed = JSON.parse(result);
    expect(parsed).toEqual([
      {
        title: 'Latest AI News',
        url: 'https://example.com/ai-news',
        snippet: 'Recent developments in artificial intelligence...',
        date: '2026-04-01',
      },
      {
        title: 'AI in Healthcare',
        url: 'https://example.com/ai-healthcare',
        snippet: 'How AI is transforming healthcare...',
      },
    ]);
  });

  test('forwards maxResults, searchDomainFilter and searchRecencyFilter', async () => {
    const tool = new PerplexitySearch({
      apiKey: 'test-api-key',
      maxResults: 3,
      searchDomainFilter: ['nytimes.com', '-pinterest.com'],
      searchRecencyFilter: 'month',
    });

    let capturedRequest;
    tool.httpClient = tool.httpClient.extend({
      hooks: {
        beforeRequest: [
          (request) => {
            capturedRequest = request;
            return new Response(JSON.stringify({ results: sampleResults }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          },
        ],
      },
    });

    await tool._call({ searchQuery: 'climate news' });

    const body = await capturedRequest.json();
    expect(body).toEqual({
      query: 'climate news',
      max_results: 3,
      search_domain_filter: ['nytimes.com', '-pinterest.com'],
      search_recency_filter: 'month',
    });
  });

  test('reads API key from PERPLEXITY_API_KEY env var', async () => {
    const original = process.env.PERPLEXITY_API_KEY;
    process.env.PERPLEXITY_API_KEY = 'env-api-key';
    try {
      const tool = new PerplexitySearch();

      let capturedRequest;
      tool.httpClient = tool.httpClient.extend({
        hooks: {
          beforeRequest: [
            (request) => {
              capturedRequest = request;
              return new Response(JSON.stringify({ results: [] }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              });
            },
          ],
        },
      });

      await tool._call({ searchQuery: 'q' });
      expect(capturedRequest.headers.get('Authorization')).toBe(
        'Bearer env-api-key'
      );
    } finally {
      if (original === undefined) {
        delete process.env.PERPLEXITY_API_KEY;
      } else {
        process.env.PERPLEXITY_API_KEY = original;
      }
    }
  });

  test('reads API key from PPLX_API_KEY env var', async () => {
    const originalPpl = process.env.PERPLEXITY_API_KEY;
    const originalPplx = process.env.PPLX_API_KEY;
    delete process.env.PERPLEXITY_API_KEY;
    process.env.PPLX_API_KEY = 'pplx-env-api-key';
    try {
      const tool = new PerplexitySearch();

      let capturedRequest;
      tool.httpClient = tool.httpClient.extend({
        hooks: {
          beforeRequest: [
            (request) => {
              capturedRequest = request;
              return new Response(JSON.stringify({ results: [] }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              });
            },
          ],
        },
      });

      await tool._call({ searchQuery: 'q' });
      expect(capturedRequest.headers.get('Authorization')).toBe(
        'Bearer pplx-env-api-key'
      );
    } finally {
      if (originalPpl === undefined) {
        delete process.env.PERPLEXITY_API_KEY;
      } else {
        process.env.PERPLEXITY_API_KEY = originalPpl;
      }
      if (originalPplx === undefined) {
        delete process.env.PPLX_API_KEY;
      } else {
        process.env.PPLX_API_KEY = originalPplx;
      }
    }
  });

  test('throws when no API key is provided and no env var is set', () => {
    const originalPpl = process.env.PERPLEXITY_API_KEY;
    const originalPplx = process.env.PPLX_API_KEY;
    delete process.env.PERPLEXITY_API_KEY;
    delete process.env.PPLX_API_KEY;
    try {
      expect(() => new PerplexitySearch()).toThrow(/missing API key/i);
    } finally {
      if (originalPpl !== undefined) process.env.PERPLEXITY_API_KEY = originalPpl;
      if (originalPplx !== undefined) process.env.PPLX_API_KEY = originalPplx;
    }
  });

  test('returns a parse error message when the response shape is invalid', async () => {
    const tool = new PerplexitySearch({ apiKey: 'test-api-key' });

    tool.httpClient = tool.httpClient.extend({
      hooks: {
        beforeRequest: [
          () =>
            new Response(JSON.stringify({ id: 'no-results-here' }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }),
        ],
      },
    });

    const result = await tool._call({ searchQuery: 'q' });
    expect(result).toBe(
      'Could not parse Perplexity search results. Please try again.'
    );
  });

  test('handles client error (4xx)', async () => {
    const tool = new PerplexitySearch({ apiKey: 'test-api-key' });

    tool.httpClient = tool.httpClient.extend({
      hooks: {
        beforeRequest: [
          () =>
            new Response(
              JSON.stringify({ error: 'invalid api key' }),
              { status: 401, headers: { 'Content-Type': 'application/json' } }
            ),
        ],
      },
    });

    const result = await tool._call({ searchQuery: 'q' });
    expect(result).toBe('API request failed: Client Error (401)');
  });

  test('handles server error (5xx)', async () => {
    const tool = new PerplexitySearch({ apiKey: 'test-api-key' });

    tool.httpClient = tool.httpClient.extend({
      hooks: {
        beforeRequest: [
          () =>
            new Response(
              JSON.stringify({ error: 'oops' }),
              { status: 500, headers: { 'Content-Type': 'application/json' } }
            ),
        ],
      },
    });

    const result = await tool._call({ searchQuery: 'q' });
    expect(result).toBe('API request failed: Server Error (500)');
  });

  test('handles unexpected errors', async () => {
    const tool = new PerplexitySearch({ apiKey: 'test-api-key' });

    tool.httpClient = tool.httpClient.extend({
      hooks: {
        beforeRequest: [
          () => {
            throw new Error('Network Error');
          },
        ],
      },
    });

    const result = await tool._call({ searchQuery: 'q' });
    expect(result).toBe('An unexpected error occurred: Network Error');
  });

  test('is exported correctly in both paths', () => {
    const {
      PerplexitySearch: PerplexitySearchScoped,
    } = require('../../dist/perplexity-search/index.cjs.js');
    const {
      PerplexitySearch: PerplexitySearchMain,
    } = require('../../dist/index.cjs.js');

    expect(typeof PerplexitySearchScoped).toBe('function');
    expect(typeof PerplexitySearchMain).toBe('function');
    expect(PerplexitySearchScoped.name).toBe(PerplexitySearchMain.name);
  });
});
