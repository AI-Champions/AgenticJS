/**
 * Data Parsing Utilities.
 *
 * This file offers functions for parsing and sanitizing data formats, particularly focusing on JSON structures that agents
 * might receive or need to process. These utilities ensure that data handled by agents is in the correct format and free of
 * errors that could disrupt processing.
 *
 * Usage:
 * Leverage these parsing utilities to preprocess or clean data before it is fed into agents or other processing functions within the library.
 */

// Utility function to clean up JSON string. to be able to parse it. later

//Examples Input

// Example 1
// "{
//    "thought": "To find detailed information about the Copa America 2024 winner, I need to search for the most recent and relevant information. Since this is a future event (as of my last update), I should verify if it has already taken place or if there are any changes to the schedule."
//    "action": "tavily_search_results_json",
//    "actionInput": {"query":"Copa America 2024 winner results details"}
// }"

// Example 2
// {\n   "thought": "To find detailed information about the Copa America 2024 winner, I need to search for the most recent and relevant information. Since this is a future event, I should be cautious about the results and verify if the tournament has actually taken place."\n   "action": "tavily_search_results_json",\n   "actionInput": {"query":"Copa America 2024 winner results details"}\n}

const _getParsedJSON_4_tests_passing = (str) => {
  try {
    // Attempt to directly parse the JSON first
    return JSON.parse(str);
  } catch (_error) {
    // Handle JSON strings with complex non-JSON text and real newlines
    // and markdown encapsulation
    const startMarker = "/```json\n";
    const endMarker = "\n```";
    let jsonStartIndex = str.indexOf("{");
    let jsonEndIndex = str.lastIndexOf("}") + 1;

    // If markdown encapsulation is detected
    if (str.includes(startMarker) && str.includes(endMarker)) {
      jsonStartIndex = str.indexOf(startMarker) + startMarker.length;
      jsonEndIndex = str.indexOf(endMarker);
    }

    // Extract the JSON part from the string
    let jsonPart = str.substring(jsonStartIndex, jsonEndIndex);

    // Normalize the JSON string by handling line breaks, missing commas, etc.
    let sanitizedStr = jsonPart
      .replace(/\\n/g, "")
      .replace(/\n/g, " ")
      .replace(/([}\]])(\s*["{])/g, "$1,$2") // Insert missing commas where necessary
      .replace(/,\s*([}\]])/g, "$1") // Remove trailing commas
      .replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2":') // Ensure keys are quoted
      .replace(/([{,]+)(\s*)(['"])?([a-z0-9A-Z_]+)(['"])?(\s*):/g, '$1"$4":') // Properly quote keys
      .replace(/,\s*}/g, "}"); // Remove any trailing commas before closing braces

    try {
      // Try parsing again after sanitation
      return JSON.parse(sanitizedStr);
    } catch (finalError) {
      console.error("Error parsing sanitized JSON: ", finalError);
      return null;
    }
  }
};

function _getParsedJSONV6(str) {
  // Define a schema based on expected keys and their patterns
  const schema = {
    thought: /"thought"\s*:\s*"([^"]*)"/,
    action: /"action"\s*:\s*"([^"]*)"/,
    actionInput: /"actionInput"\s*:\s*({[^}]*})/,
    observation: /"observation"\s*:\s*"([^"]*)"/,
    isFinalAnswerReady: /"isFinalAnswerReady"\s*:\s*(true|false)/,
    finalAnswer: /"finalAnswer"\s*:\s*"([^"]*)"/,
  };

  let result = {};

  // Iterate over each key in the schema to find matches in the input string
  for (let key in schema) {
    const regex = schema[key];
    const match = str.match(regex);
    if (match) {
      // If the key is found, parse the value appropriately
      if (key === "actionInput") {
        // Assuming actionInput always contains a JSON-like object
        try {
          result[key] = JSON.parse(match[1].replace(/'/g, '"'));
        } catch (_e) {
          result[key] = null; // Default to null if parsing fails
        }
      } else if (key === "isFinalAnswerReady") {
        result[key] = match[1] === "true"; // Convert string to boolean
      } else {
        result[key] = match[1];
      }
    }
  }

  return result;
}

function getParsedJSON(str) {
  try {
    // First attempt to parse the JSON string directly
    return JSON.parse(str);
  } catch (_e) {
    // If JSON parsing fails, fall back to regex extraction
    const schema = {
      thought: /"thought"\s*:\s*"([^"]*)"/,
      action: /"action"\s*:\s*"([^"]*)"/,
      actionInput: /"actionInput"\s*:\s*({[^}]*})/,
      observation: /"observation"\s*:\s*"([^"]*)"/,
      isFinalAnswerReady: /"isFinalAnswerReady"\s*:\s*(true|false)/,
      finalAnswer: /"finalAnswer"\s*:\s*"([^"]*)"/,
    };

    let result = {};

    // Iterate over each key in the schema to find matches in the input string
    for (let key in schema) {
      const regex = schema[key];
      const match = str.match(regex);
      if (match) {
        // If the key is found, parse the value appropriately
        if (key === "actionInput") {
          // Assuming actionInput always contains a JSON-like object
          try {
            result[key] = JSON.parse(match[1].replace(/'/g, '"'));
          } catch (_e) {
            result[key] = null; // Default to null if parsing fails
          }
        } else if (key === "isFinalAnswerReady") {
          result[key] = match[1] === "true"; // Convert string to boolean
        } else {
          result[key] = match[1];
        }
      }
    }

    return result;
  }
}

export { getParsedJSON };
