/**
 * LLM Cost Calculation Utilities.
 *
 * This file contains functions for calculating the costs associated with using large language models (LLMs) based on
 * token usage and model-specific pricing. It helps in budgeting and monitoring the financial aspects of using LLMs within
 * the KaibanJS library.
 *
 * Usage:
 * Apply these functions to compute and track costs as part of operational management and optimization of LLM usage in projects.
 */

import { logger } from "./logger";

const modelsPricing = [
  // GPT Models from OpenAI
  {
    modelCode: "gpt-4o-mini",
    provider: "openai",
    inputPricePerMillionTokens: 0.15,
    outputPricePerMillionTokens: 0.6,
    features: "Most cost-efficient with vision capabilities",
  },
  {
    modelCode: "gpt-3.5-turbo",
    provider: "openai",
    inputPricePerMillionTokens: 0.5,
    outputPricePerMillionTokens: 1.5,
    features: "Cost-effective option",
  },
  {
    modelCode: "gpt-3.5-turbo-0125",
    provider: "openai",
    inputPricePerMillionTokens: 0.5,
    outputPricePerMillionTokens: 1.5,
    features: "Cost-effective option",
  },
  {
    modelCode: "gpt-4o",
    provider: "openai",
    inputPricePerMillionTokens: 5.0,
    outputPricePerMillionTokens: 15.0,
    features: "Enhanced multimodal capabilities",
  },
  {
    modelCode: "gpt-4-turbo",
    provider: "openai",
    inputPricePerMillionTokens: 10.0,
    outputPricePerMillionTokens: 30.0,
    features: "High speed and power",
  },
  {
    modelCode: "gpt-4",
    provider: "openai",
    inputPricePerMillionTokens: 30.0,
    outputPricePerMillionTokens: 60.0,
    features: "Latest generation AI",
  },
  // Claude Models from Anthropic
  {
    modelCode: "claude-3-5-sonnet-20240620",
    provider: "anthropic",
    inputPricePerMillionTokens: 3,
    outputPricePerMillionTokens: 15,
    features: "Highest level of intelligence and capability",
  },
  {
    modelCode: "claude-3-opus-20240229",
    provider: "anthropic",
    inputPricePerMillionTokens: 15,
    outputPricePerMillionTokens: 75,
    features: "Top-level performance, intelligence, fluency, and understanding",
  },
  {
    modelCode: "claude-3-sonnet-20240229",
    provider: "anthropic",
    inputPricePerMillionTokens: 3,
    outputPricePerMillionTokens: 15,
    features: "Strong utility, balanced for scaled deployments",
  },
  {
    modelCode: "claude-3-haiku-20240307",
    provider: "anthropic",
    inputPricePerMillionTokens: 0.25,
    outputPricePerMillionTokens: 1.25,
    features: "Quick and accurate targeted performance",
  },
  // Gemini Models from Google
  {
    modelCode: "gemini-1.5-flash",
    provider: "google",
    inputPricePerMillionTokens: 0.35,
    outputPricePerMillionTokens: 1.05,
    features: "Fast multimodal model with 1 million token context window",
  },
  {
    modelCode: "gemini-1.5-pro",
    provider: "google",
    inputPricePerMillionTokens: 3.5,
    outputPricePerMillionTokens: 10.5,
    features: "Next-generation model with 2 million token context window",
  },
  {
    modelCode: "gemini-1.0-pro",
    provider: "google",
    inputPricePerMillionTokens: 0.5,
    outputPricePerMillionTokens: 1.5,
    features: "First-generation model, only text and image reasoning",
  },
  // Mistral Models
  {
    modelCode: "open-mistral-nemo-2407",
    provider: "mistral",
    inputPricePerMillionTokens: 0.3,
    outputPricePerMillionTokens: 0.3,
    features:
      "Mistral Nemo is a state-of-the-art 12B model developed with NVIDIA",
  },
  {
    modelCode: "mistral-large-2407",
    provider: "mistral",
    inputPricePerMillionTokens: 3,
    outputPricePerMillionTokens: 9,
    features:
      "Top-tier reasoning for high-complexity tasks, for your most sophisticated needs",
  },
  {
    modelCode: "codestral-2405",
    provider: "mistral",
    inputPricePerMillionTokens: 1,
    outputPricePerMillionTokens: 3,
    features:
      "State-of-the-art Mistral model trained specifically for code tasks",
  },
];

/**
 * Calculates the approximate cost of using a specified AI model based on the number of input and output tokens.
 * If the model code does not match any in the predefined list, it returns a standardized error response with costs set to -1.
 *
 * @param {string} modelCode - The unique code identifier for the AI model.
 * @param {object} llmUsageStats - An object containing usage statistics including:
 *     - inputTokens: The number of input tokens processed.
 *     - outputTokens: The number of output tokens generated.
 *     - callsCount: The total number of calls made.
 *     - callsErrorCount: The number of failed calls.
 *     - parsingErrors: The number of errors encountered during parsing.
 * @returns {object} An object containing:
 *     - costInputTokens: The calculated cost for the input tokens or -1 if the model is not found.
 *     - costOutputTokens: The calculated cost for the output tokens or -1 if the model is not found.
 *     - totalCost: The total cost combining input and output tokens or -1 if the model is not found.
 *
 * @example
 * // Calculate costs for a known model with usage stats
 * const llmUsageStats = {
 *   inputTokens: 500000,
 *   outputTokens: 200000,
 *   callsCount: 10,
 *   callsErrorCount: 1,
 *   parsingErrors: 0
 * };
 * const costDetails = calculateCost('gpt-4o-mini', llmUsageStats);
 * console.log(costDetails);
 */
function calculateTaskCost(modelCode, llmUsageStats) {
  const model = modelsPricing.find((m) => m.modelCode === modelCode);
  if (!model) {
    return {
      costInputTokens: -1,
      costOutputTokens: -1,
      totalCost: -1,
    };
  }

  const inputCost =
    (llmUsageStats.inputTokens / 1000000) * model.inputPricePerMillionTokens;
  const outputCost =
    (llmUsageStats.outputTokens / 1000000) * model.outputPricePerMillionTokens;
  const totalCost = inputCost + outputCost;

  return {
    costInputTokens: parseFloat(inputCost.toFixed(4)),
    costOutputTokens: parseFloat(outputCost.toFixed(4)),
    totalCost: parseFloat(totalCost.toFixed(4)),
  };
}

function calculateTotalWorkflowCost(modelUsageStats) {
  let totalInputCost = 0;
  let totalOutputCost = 0;
  let totalCost = 0;
  let _totalInputTokens = 0;
  let _totalOutputTokens = 0;
  let allPricesAvailable = true;

  Object.keys(modelUsageStats).forEach((modelCode) => {
    const stats = modelUsageStats[modelCode];
    const model = modelsPricing.find((m) => m.modelCode === modelCode);
    if (!model) {
      logger.warn(`No pricing information found for model ${modelCode}`);
      allPricesAvailable = false;
      return;
    }
    const inputCost =
      (stats.inputTokens / 1000000) * model.inputPricePerMillionTokens;
    const outputCost =
      (stats.outputTokens / 1000000) * model.outputPricePerMillionTokens;
    totalInputCost += inputCost;
    totalOutputCost += outputCost;
    totalCost += inputCost + outputCost;
    _totalInputTokens += stats.inputTokens;
    _totalOutputTokens += stats.outputTokens;
  });

  if (!allPricesAvailable) {
    return {
      costInputTokens: -1,
      costOutputTokens: -1,
      totalCost: -1,
    };
  }

  return {
    costInputTokens: parseFloat(totalInputCost.toFixed(4)),
    costOutputTokens: parseFloat(totalOutputCost.toFixed(4)),
    totalCost: parseFloat(totalCost.toFixed(4)),
  };
}

export { calculateTaskCost, calculateTotalWorkflowCost };
