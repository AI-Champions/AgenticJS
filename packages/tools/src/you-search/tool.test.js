const { YouSearch } = require('../../dist/you-search/index.cjs.js');

describe('YouSearch', () => {
  test('YouSearch sends correct default parameters and receives results', async () => {
    const tool = new YouSearch({ apiKey: 'test-api-key' });

    let capturedRequest;
    tool.httpClient = tool.httpClient.extend({
      hooks: {
        beforeRequest: [
          (request) => {
            capturedRequest = request;
            return new Response(
              JSON.stringify({
                results: {
                  web: [
                    {
                      title: 'KaibanJS Documentation',
                      url: 'https://docs.kaibanjs.com',
                      description:
                        'KaibanJS is a JavaScript framework for multi-agent systems.',
                    },
                  ],
                  news: [],
                },
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          },
        ],
      },
    });

    const result = await tool._call({ searchQuery: 'kaibanjs framework' });

    // Check request
    expect(capturedRequest.url).toBe('https://api.you.com/api/search');
    expect(capturedRequest.method).toBe('POST');
    expect(capturedRequest.headers.get('X-API-Key')).toBe('test-api-key');
    expect(capturedRequest.headers.get('content-type')).toBe(
      'application/json'
    );

    const body = await capturedRequest.json();
    expect(body).toMatchObject({
      query: 'kaibanjs framework',
      numResults: 5,
    });

    // Check response structure — the tool returns the web results array as JSON
    const parsed = JSON.parse(result);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0]).toMatchObject({
      title: 'KaibanJS Documentation',
      url: 'https://docs.kaibanjs.com',
    });
  });

  test('YouSearch forwards optional freshness filter', async () => {
    const tool = new YouSearch({ apiKey: 'test-api-key', freshness: 'week' });

    let capturedRequest;
    tool.httpClient = tool.httpClient.extend({
      hooks: {
        beforeRequest: [
          (request) => {
            capturedRequest = request;
            return new Response(
              JSON.stringify({ results: { web: [], news: [] } }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          },
        ],
      },
    });

    await tool._call({ searchQuery: 'latest news' });

    const body = await capturedRequest.json();
    expect(body).toMatchObject({
      query: 'latest news',
      numResults: 5,
      freshness: 'week',
    });
  });

  test('YouSearch handles empty result sets', async () => {
    const tool = new YouSearch({ apiKey: 'test-api-key', numResults: 3 });

    tool.httpClient = tool.httpClient.extend({
      hooks: {
        beforeRequest: [
          () => {
            return new Response(
              JSON.stringify({ results: { web: [], news: [] } }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          },
        ],
      },
    });

    const result = await tool._call({ searchQuery: 'obscure query' });
    expect(result).toBe('[]');
  });

  test('YouSearch handles malformed responses gracefully', async () => {
    const tool = new YouSearch({ apiKey: 'test-api-key' });

    tool.httpClient = tool.httpClient.extend({
      hooks: {
        beforeRequest: [
          () => {
            return new Response(JSON.stringify({ unexpected: true }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          },
        ],
      },
    });

    const result = await tool._call({ searchQuery: 'test query' });
    expect(result).toBe('Could not parse You.com results. Please try again.');
  });

  test('YouSearch handles HTTP client errors', async () => {
    const tool = new YouSearch({ apiKey: 'test-api-key' });

    tool.httpClient = tool.httpClient.extend({
      hooks: {
        beforeRequest: [
          () => {
            return new Response('Unauthorized', { status: 401 });
          },
        ],
      },
    });

    const result = await tool._call({ searchQuery: 'test query' });
    expect(result).toBe('API request failed: Client Error (401)');
  });

  test('YouSearch handles HTTP server errors', async () => {
    const tool = new YouSearch({ apiKey: 'test-api-key' });

    tool.httpClient = tool.httpClient.extend({
      hooks: {
        beforeRequest: [
          () => {
            return new Response('Server Error', { status: 500 });
          },
        ],
      },
    });

    const result = await tool._call({ searchQuery: 'test query' });
    expect(result).toBe('API request failed: Server Error (500)');
  });

  test('YouSearch handles unexpected errors', async () => {
    const tool = new YouSearch({ apiKey: 'test-api-key' });

    tool.httpClient = tool.httpClient.extend({
      hooks: {
        beforeRequest: [
          () => {
            throw new Error('Network Error');
          },
        ],
      },
    });

    const result = await tool._call({ searchQuery: 'test query' });
    expect(result).toBe('An unexpected error occurred: Network Error');
  });

  test('YouSearch is exported correctly in both paths', () => {
    const { YouSearch: YouSearchFromPath } = require('../../dist/you-search/index.cjs.js');
    const { YouSearch: YouSearchMain } = require('../../dist/index.cjs.js');

    // Check that both imports are constructor functions
    expect(typeof YouSearchFromPath).toBe('function');
    expect(typeof YouSearchMain).toBe('function');

    // Check they have the same name and properties
    expect(YouSearchFromPath.name).toBe(YouSearchMain.name);
    expect(Object.keys(YouSearchFromPath.prototype)).toEqual(
      Object.keys(YouSearchMain.prototype)
    );
  });
});
