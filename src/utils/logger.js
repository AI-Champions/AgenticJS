/**
 * Logging Utility.
 *
 * This file sets up and configures the logging system used across the KaibanJS library. It allows for setting log levels
 * dynamically and provides a centralized logger that can be imported and used throughout the library.
 *
 * Usage:
 * Import this logger to add logging capabilities to any part of the application, facilitating debugging and tracking of
 * application flow and state changes.
 */

import log from "loglevel";

// Set initial log level
log.setLevel(log.levels.INFO); // Default to 'info' level

// To set log level dynamically
const setLogLevel = (level) => {
  log.setLevel(log.levels[level.toUpperCase()]);
};

export { log as logger, setLogLevel };
