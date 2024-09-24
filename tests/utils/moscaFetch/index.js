const fs = require("fs");

function moscaFetch() {
  let originalFetch = globalThis.fetch; // Save the original fetch function
  // Step 1: Define your custom fetch function
  // Define your custom fetch function
  let myCustomFetch = async (input, options) => {
    //console.log('MoscaFetch -> Using custom fetch for:', input);
    for (const mock of mocks) {
      let { body: requestBody, method: requestMethod = "GET" } = options || {};
      requestMethod = requestMethod.toUpperCase();
      try {
        requestBody = requestBody ? JSON.parse(requestBody) : undefined;
      } catch (_error) {
        // requestBody remains unchanged if it's not JSON
      }

      const urlMatches = mock.url === "*" || input === mock.url;
      const methodMatches =
        mock.method === "*" || mock.method.toUpperCase() === requestMethod;

      const cleanRequestBody = JSON.stringify(requestBody).replace(
        /\\n\s+/g,
        "\\n"
      ); // Regular Expression to remove spaces between newlines
      const cleanMockBody = JSON.stringify(mock.body).replace(/\\n\s+/g, "\\n"); // Regular Expression to remove spaces between newlines

      const bodyMatches =
        mock.body === "*" || cleanRequestBody === cleanMockBody;
      if (urlMatches && methodMatches && bodyMatches) {
        if (mock.isRecorder) {
          const response = await originalFetch(input, options);
          const clonedResponse = response.clone();
          records.push({
            url: input,
            method: requestMethod,
            body: requestBody,
            response: await clonedResponse.json(), // Assuming JSON response
          });
          if (mock.callback) {
            mock.callback({
              request: { url: input, method: requestMethod, body: requestBody },
              response: response,
              status: response.status,
            });
          }
          return response; // Ensure recorders do not block the response
        } else {
          const mockResponse = new Response(JSON.stringify(mock.response), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
          if (mock.callback) {
            mock.callback({
              request: { url: input, method: requestMethod, body: requestBody },
              response: mockResponse,
              status: mockResponse.status,
            });
          }
          return Promise.resolve(mockResponse);
        }
      }
    }
    //console.log('MoscaFetch -> No mocks or recorders matched:', input);
    return originalFetch(input, options); // Call the original fetch if no mocks or recorders match
  };

  // Immediately enforce custom fetch
  const withMockedApis =
    process.env.TEST_ENV === "mocked-llm-apis" ? true : false;
  if (withMockedApis) {
    // Override globalThis.fetch with your custom fetch
    globalThis.fetch = myCustomFetch;
  }

  let mocks = [];
  let records = [];

  function mock(mockConfigs) {
    // Ensure the input is always treated as an array, even if it's a single object
    const configs = Array.isArray(mockConfigs) ? mockConfigs : [mockConfigs];

    configs.forEach((mockConfig) => {
      if (!mockConfig.url || !mockConfig.method || !mockConfig.response) {
        throw new Error(
          "Invalid mock configuration: Missing required properties."
        );
      }
      mockConfig.isRecorder = false; // Explicitly flag mock configurations as non-recorders
      mocks.push(mockConfig);
    });
    ensureFetchIsMocked();
  }

  function record(recordConfig) {
    recordConfig.isRecorder = true; // Flag record configurations as recorders
    mocks.push(recordConfig);
    ensureFetchIsMocked();
  }

  function getRecords() {
    return records;
  }

  function clearRecords() {
    records = [];
  }

  function restoreAll() {
    globalThis.fetch = originalFetch; // Restore the original fetch function
    mocks = []; // Clear all mocks and recorders
  }

  function restoreOne(url, method) {
    mocks = mocks.filter(
      (mock) =>
        !(mock.url === url || mock.url === "*") ||
        mock.method.toLowerCase() !== method.toLowerCase()
    );
    if (mocks.length === 0) {
      restoreAll();
    }
  }

  function ensureFetchIsMocked() {
    // Always ensure myCustomFetch is the global fetch
    if (globalThis.fetch !== myCustomFetch) {
      globalThis.fetch = myCustomFetch;
    }
  }

  function saveRecords(filename = "recordedData.json") {
    const filePath = `${process.cwd()}/${filename}`;
    fs.writeFile(filePath, JSON.stringify(records, null, 2), (err) => {
      if (err) {
        console.error("Error saving records:", err);
      } else {
        console.log(`Records saved successfully to ${filePath}`);
      }
    });
  }

  // Immediately enforce custom fetch
  if (withMockedApis) {
    ensureFetchIsMocked();
  }
  return {
    mock,
    record,
    getRecords,
    clearRecords,
    restoreAll,
    restoreOne,
    saveRecords,
  };
}

module.exports = moscaFetch;
