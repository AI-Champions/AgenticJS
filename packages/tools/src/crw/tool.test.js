const { Crw } = require('../../dist/crw/index.cjs.js');

describe('Crw', () => {
  test('Crw sends correct default parameters and receives markdown', async () => {
    const tool = new Crw({ apiKey: 'test-api-key' });

    let capturedRequest;
    tool.httpClient = tool.httpClient.extend({
      hooks: {
        beforeRequest: [
          (request) => {
            capturedRequest = request;
            return new Response(
              JSON.stringify({
                data: {
                  markdown: '# Test Content\n\nThis is a test.',
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

    const result = await tool._call({ url: 'https://example.com' });

    // Check request
    expect(capturedRequest.url).toBe('https://fastcrw.com/api/v1/scrape');
    expect(capturedRequest.method).toBe('POST');
    expect(capturedRequest.headers.get('Authorization')).toBe(
      'Bearer test-api-key'
    );
    const body = await capturedRequest.json();
    expect(body).toEqual({
      url: 'https://example.com',
      formats: ['markdown'],
    });

    // Check response
    expect(result).toBe('# Test Content\n\nThis is a test.');
  });

  test('Crw sends correct parameters with custom format and receives HTML', async () => {
    const tool = new Crw({ apiKey: 'test-api-key', format: 'html' });

    let capturedRequest;
    tool.httpClient = tool.httpClient.extend({
      hooks: {
        beforeRequest: [
          (request) => {
            capturedRequest = request;
            return new Response(
              JSON.stringify({
                data: {
                  html: '<h1>Test Content</h1><p>This is a test.</p>',
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

    const result = await tool._call({ url: 'https://example.com' });

    // Check request
    expect(capturedRequest.url).toBe('https://fastcrw.com/api/v1/scrape');
    expect(capturedRequest.method).toBe('POST');
    expect(capturedRequest.headers.get('Authorization')).toBe(
      'Bearer test-api-key'
    );
    const body = await capturedRequest.json();
    expect(body).toEqual({
      url: 'https://example.com',
      formats: ['html'],
    });

    // Check response
    expect(result).toBe('<h1>Test Content</h1><p>This is a test.</p>');
  });

  test('Crw targets a custom apiUrl for self-hosting', async () => {
    const tool = new Crw({
      apiKey: 'test-api-key',
      apiUrl: 'http://localhost:3000',
    });

    let capturedRequest;
    tool.httpClient = tool.httpClient.extend({
      hooks: {
        beforeRequest: [
          (request) => {
            capturedRequest = request;
            return new Response(
              JSON.stringify({
                data: {
                  markdown: '# Self Hosted',
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

    const result = await tool._call({ url: 'https://example.com' });

    // Check request targets the self-hosted base URL
    expect(capturedRequest.url).toBe('http://localhost:3000/v1/scrape');
    expect(result).toBe('# Self Hosted');
  });

  test('Crw handles client error (4xx)', async () => {
    const tool = new Crw({ apiKey: 'test-api-key' });

    tool.httpClient = tool.httpClient.extend({
      hooks: {
        beforeRequest: [
          () => {
            return new Response(JSON.stringify({ error: 'Not Found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            });
          },
        ],
      },
    });

    const result = await tool._call({ url: 'https://example.com' });

    expect(result).toBe('API request failed: Client Error (404)');
  });

  test('Crw handles server error (5xx)', async () => {
    const tool = new Crw({ apiKey: 'test-api-key' });

    tool.httpClient = tool.httpClient.extend({
      hooks: {
        beforeRequest: [
          () => {
            return new Response(
              JSON.stringify({ error: 'Internal Server Error' }),
              {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          },
        ],
      },
    });

    const result = await tool._call({ url: 'https://example.com' });

    expect(result).toBe('API request failed: Server Error (500)');
  });

  test('Crw handles unexpected errors', async () => {
    const tool = new Crw({ apiKey: 'test-api-key' });

    tool.httpClient = tool.httpClient.extend({
      hooks: {
        beforeRequest: [
          () => {
            throw new Error('Network Error');
          },
        ],
      },
    });

    const result = await tool._call({ url: 'https://example.com' });

    expect(result).toBe('An unexpected error occurred: Network Error');
  });

  test('Crw is exported correctly in both paths', () => {
    const { Crw } = require('../../dist/crw/index.cjs.js');
    const { Crw: CrwMain } = require('../../dist/index.cjs.js');

    // Check that both imports are constructor functions
    expect(typeof Crw).toBe('function');
    expect(typeof CrwMain).toBe('function');

    // Check they have the same name and properties
    expect(Crw.name).toBe(CrwMain.name);
    expect(Object.keys(Crw.prototype)).toEqual(
      Object.keys(CrwMain.prototype)
    );
  });
});
