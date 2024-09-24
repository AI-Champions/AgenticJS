/**
 * Custom Error Definitions.
 *
 * This file defines custom error classes for handling specific error scenarios within the KaibanJS library. It includes
 * errors for API invocation failures and more nuanced errors that provide detailed diagnostic information. Custom errors
 * enhance error handling by making it more informative and actionable.
 *
 * Usage:
 * Utilize these custom errors to throw and catch exceptions that require specific handling strategies, thereby improving
 * the robustness and reliability of error management in the application.
 */

class LLMInvocationError extends Error {
  constructor(
    message,
    originalError = null,
    recommendedAction = null,
    context = {}
  ) {
    super(message);
    this.name = "LLMInvocationError";
    this.context = context;
    this.originalError = originalError; // Store the original error if there is one
    this.recommendedAction = recommendedAction; // Actionable steps to resolve or mitigate the error
    Error.captureStackTrace(this, this.constructor); // Ensures the stack trace starts from where this error was thrown
  }
}

class PrettyError extends Error {
  constructor({
    message,
    rootError = null,
    recommendedAction = null,
    context = {},
    location = "",
    type = "Error",
    name = "PrettyError",
  }) {
    super(message); // Store the original simple message
    this.type = type;
    this.name = name;
    this.rootError = rootError;
    this.recommendedAction = recommendedAction;
    this.context = context;
    this.location = location;
    Error.captureStackTrace(this, this.constructor);

    // Standardize the error message and store it in prettyMessage
    this.prettyMessage = this.createPrettyMessage();
  }

  /**
   * Create a standardized error message incorporating all relevant information.
   * Conditionally includes parts of the message only if they contain valid data.
   * @returns {string} A formatted and informative error message.
   */
  createPrettyMessage() {
    let msg = `${this.name}: ${this.message}\n`; // Start with the error type
    if (this.rootError && this.rootError.message) {
      msg += `Details: ${this.rootError.message}\n\n`; // Include details about the root cause if available
    }
    if (this.recommendedAction) {
      msg += `Recommended Action: ${this.recommendedAction}\n`; // Include recommended actions if provided
    }

    return msg; // Return the constructed pretty message
  }
}

export { LLMInvocationError, PrettyError };
