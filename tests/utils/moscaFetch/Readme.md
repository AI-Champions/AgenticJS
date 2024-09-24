# MoscaFetch Utility

## Introduction

`moscaFetch` is a testing utility designed to simplify the process of mocking and recording HTTP requests in Node.js environments. It provides an easy-to-use API for setting up mocks and capturing actual request-response cycles for use in tests.

## Features

- **Mock HTTP Requests**: Simulate HTTP responses without making actual network calls.
- **Record Requests**: Capture and log HTTP requests and responses to refine tests or mock setups.
- **Callbacks**: Execute custom logic after a mocked request is handled.
- **Restore**: Cleanly revert any modifications to the global fetch, maintaining test isolation.

### Usage

#### Importing

```js
const { mock, record, restoreAll, getRecords } = require("moscaFetch");
```

#### Mocking Requests

To mock HTTP requests:

```js
mock({
  url: "https://api.example.com/data",
  method: "POST",
  body: "*",
  response: { key: "value" },
  callback: (info) => console.log("Request completed", info),
});
```

Or use wildcard \* to mock all Request

```js
mock({
  url: "*",
  method: "*",
  response: "*",
  callback: (info) => console.log("Request completed", info),
});
```

Configuration Options

- `url`: URL to match the request (string or wildcard `*`).
- `method`: HTTP method to match (string or wildcard `*`).
- `expectedBody`: Expected body to match for incoming requests (object or wildcard `*`).
- `response`: Response to return when a request is matched.
- `callback`: Function to execute after a request is handled.

#### Recording Requests

To record requests for later analysis or setup:

```js
// Setting up recording
record({
  url: "*",
  method: "*",
  body: "*", // Record any POST request to this URL
});

// After your requests
const recordedData = getRecords();
debugger;
console.log(recordedData);
// Then Copy/Paste the object from the console
```

#### Retrieving Records

To retrieve and log the recorded requests:

```js
const records = getRecords();
console.log(records);
```

#### Restoring Fetch

To restore the original fetch after tests:

```js
restoreAll();
```

### Contributing

Contributions are welcome! Please read our contributing guidelines to get started.

### License

moscaFetch is MIT licensed.
