/**
 * Store Modules Centralization.
 *
 * This file acts as the central export point for all state management store modules within the KaibanJS library. It consolidates
 * the exports of various stores such as agentStore, taskStore, and teamStore, facilitating easier and more organized access across
 * the library. This centralization supports modular architecture and enhances maintainability by grouping all store-related
 * exports in one place.
 *
 * Usage:
 * Import store modules from this file to access and manage the application's state related to agents, tasks, and teams efficiently.
 * This setup ensures that updates and changes to store configurations are propagated consistently throughout the application.
 */

export * from "./teamStore";
