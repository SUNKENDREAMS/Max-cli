/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CountTokensResponse,
  GenerateContentResponse,
  GenerateContentParameters,
  CountTokensParameters,
  EmbedContentResponse,
  EmbedContentParameters,
  GoogleGenAI,
} from '@google/genai';
// import { createCodeAssistContentGenerator } from '../code_assist/codeAssist.js'; // Removed
import { DEFAULT_LOCAL_MODEL } from '../config/models.js';
import { getEffectiveModel } from './modelCheck.js';

/**
 * Interface abstracting the core functionalities for generating content and counting tokens.
 */
export interface ContentGenerator {
  generateContent(
    request: GenerateContentParameters,
  ): Promise<GenerateContentResponse>;

  generateContentStream(
    request: GenerateContentParameters,
  ): Promise<AsyncGenerator<GenerateContentResponse>>;

  countTokens(request: CountTokensParameters): Promise<CountTokensResponse>;

  embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse>;
}

export enum AuthType {
  // LOGIN_WITH_GOOGLE_PERSONAL = 'oauth-personal', // Removed as Code Assist specific path is removed
  USE_GEMINI = 'gemini-api-key', // Retained for optional Gemini API key use
  USE_VERTEX_AI = 'vertex-ai',   // Retained for optional Vertex AI use
  OLLAMA = 'ollama',
}

export type ContentGeneratorConfig = {
  model: string;
  apiKey?: string;
  vertexai?: boolean;
  authType?: AuthType | undefined;
};

export async function createContentGeneratorConfig(
  model: string | undefined,
  authType: AuthType | undefined,
  config?: { getModel?: () => string },
): Promise<ContentGeneratorConfig> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const googleApiKey = process.env.GOOGLE_API_KEY;
  const googleCloudProject = process.env.GOOGLE_CLOUD_PROJECT;
  const googleCloudLocation = process.env.GOOGLE_CLOUD_LOCATION;

  // Use runtime model from config if available, otherwise fallback to parameter or default
  let effectiveModel = config?.getModel?.() || model || DEFAULT_LOCAL_MODEL;

  const contentGeneratorConfig: ContentGeneratorConfig = {
    model: effectiveModel, // Initially set, might be updated below for specific auth types if needed
    authType,
  };

  // if we are using google auth nothing else to validate for now
  // if (authType === AuthType.LOGIN_WITH_GOOGLE_PERSONAL) { // This auth type is now effectively like others or removed
  //   return contentGeneratorConfig;
  // }

  // For USE_GEMINI or USE_VERTEX_AI, the model name might include a prefix like "gemini/"
  // The getEffectiveModel call was primarily for Gemini Pro/Flash fallback, which is removed.
  // The Ollama path doesn't need this specific check.
  // If a model name needs validation or adjustment for Gemini/Vertex, it would happen here,
  // but the complex fallback logic is gone.
  if (authType === AuthType.USE_GEMINI && geminiApiKey) {
    contentGeneratorConfig.apiKey = geminiApiKey;
    // Potentially, a simple validation or prefixing for `contentGeneratorConfig.model` could go here if needed
    // For now, we assume the provided model name is sufficient.
    // contentGeneratorConfig.model = await getEffectiveModel(...) // Removed
  } else if (
    authType === AuthType.USE_VERTEX_AI &&
    !!googleApiKey &&
    googleCloudProject &&
    googleCloudLocation
  ) {
    contentGeneratorConfig.apiKey = googleApiKey;
    contentGeneratorConfig.vertexai = true;
    // contentGeneratorConfig.model = await getEffectiveModel(...) // Removed
  }


  // Ensure the model in contentGeneratorConfig is finalized if any adjustments were made.
  // If no specific adjustments for USE_GEMINI or USE_VERTEX_AI are made above,
  // effectiveModel is already set correctly.
  contentGeneratorConfig.model = effectiveModel;


  if (authType === AuthType.OLLAMA) {
    // Specific Ollama config (endpoint, model name) will be handled
    // in OllamaContentGenerator.
    return contentGeneratorConfig;
  }

  return contentGeneratorConfig;
}

import { OllamaContentGenerator } from './ollamaContentGenerator.js'; // Ensure this import is present

export async function createContentGenerator(
  config: ContentGeneratorConfig,
): Promise<ContentGenerator> {
  const version = process.env.CLI_VERSION || process.version;
  const httpOptions = {
    headers: {
      'User-Agent': `MaxHeadroomCLI/${version} (${process.platform}; ${process.arch})`,
    },
  };
  // if (config.authType === AuthType.LOGIN_WITH_GOOGLE_PERSONAL) { // Removed Code Assist path
  //   return createCodeAssistContentGenerator(httpOptions, config.authType);
  // }

  if (
    config.authType === AuthType.USE_GEMINI ||
    config.authType === AuthType.USE_VERTEX_AI
  ) {
    const googleGenAI = new GoogleGenAI({
      apiKey: config.apiKey === '' ? undefined : config.apiKey,
      vertexai: config.vertexai,
      httpOptions,
    });

    return googleGenAI.models;
  }

  if (config.authType === AuthType.OLLAMA) {
    return new OllamaContentGenerator(); // Re-adding Ollama generator
  }

  throw new Error(
    `Error creating contentGenerator: Unsupported authType: ${config.authType}`,
  );
}
