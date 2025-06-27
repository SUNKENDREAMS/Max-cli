/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthType, StructuredError } from 'max-headroom-cli-core'; // Renamed

// Cloud-specific rate limit messages are less relevant for an offline-first tool.
// Kept for optional cloud use, but Ollama would use the default.
const RATE_LIMIT_ERROR_MESSAGE_GOOGLE_SERVICES =
  '\nThe AI service has indicated a rate limit. Please wait and try again. If using a Google Cloud service, check your quotas. For personal Google accounts, usage limits apply.';
const RATE_LIMIT_ERROR_MESSAGE_OLLAMA = // New message for Ollama
  '\nThe local Ollama service returned a rate limit error (e.g., 429). This might be due to a proxy or if the Ollama server itself has concurrent request limits. Please check your Ollama server logs and configuration.';
const RATE_LIMIT_ERROR_MESSAGE_DEFAULT =
  'Your request has been rate limited by the AI service. Please wait and try again later.';

export interface ApiError {
  error: {
    code: number;
    message: string;
    status: string;
    details: unknown[];
  };
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as ApiError).error === 'object' &&
    'message' in (error as ApiError).error
  );
}

function isStructuredError(error: unknown): error is StructuredError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as StructuredError).message === 'string'
  );
}

function getRateLimitMessage(authType?: AuthType): string {
  switch (authType) {
    case AuthType.LOGIN_WITH_GOOGLE_PERSONAL:
    case AuthType.USE_GEMINI:
    case AuthType.USE_VERTEX_AI:
      return RATE_LIMIT_ERROR_MESSAGE_GOOGLE_SERVICES; // Consolidated message
    case AuthType.OLLAMA:
      return RATE_LIMIT_ERROR_MESSAGE_OLLAMA;
    default:
      return RATE_LIMIT_ERROR_MESSAGE_DEFAULT;
  }
}

export function parseAndFormatApiError(
  error: unknown,
  authType?: AuthType,
): string {
  const errorPrefix = '[AI Service Error: '; // Changed prefix
  const unknownErrorMsg = `${errorPrefix}An unknown error occurred.]`;

  if (isStructuredError(error)) {
    let text = `${errorPrefix}${error.message}]`;
    if (error.status === 429) {
      text += getRateLimitMessage(authType);
    }
    return text;
  }

  // The error message might be a string containing a JSON object.
  if (typeof error === 'string') {
    const jsonStart = error.indexOf('{');
    if (jsonStart === -1) {
      return `${errorPrefix}${error}]`; // Not a JSON error, return as is.
    }

    const jsonString = error.substring(jsonStart);

    try {
      const parsedError = JSON.parse(jsonString) as unknown;
      if (isApiError(parsedError)) {
        let finalMessage = parsedError.error.message;
        try {
          // See if the message is a stringified JSON with another error
          const nestedError = JSON.parse(finalMessage) as unknown;
          if (isApiError(nestedError)) {
            finalMessage = nestedError.error.message;
          }
        } catch (_e) {
          // It's not a nested JSON error, so we just use the message as is.
        }
        let text = `${errorPrefix}${finalMessage} (Status: ${parsedError.error.status})]`;
        if (parsedError.error.code === 429) {
          text += getRateLimitMessage(authType);
        }
        return text;
      }
    } catch (_e) {
      // Not a valid JSON, fall through and return the original message.
    }
    return `${errorPrefix}${error}]`;
  }

  return unknownErrorMsg;
}
