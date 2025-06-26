/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Text } from 'ink';
import { Colors } from '../colors.js';
import { type MCPServerConfig } from 'max-headroom-cli-core'; // Updated import

interface ContextSummaryDisplayProps {
  contextFileCount: number; // Renamed
  contextFileNames: string[];
  mcpServers?: Record<string, MCPServerConfig>;
  showToolDescriptions?: boolean;
}

export const ContextSummaryDisplay: React.FC<ContextSummaryDisplayProps> = ({
  contextFileCount, // Renamed
  contextFileNames,
  mcpServers,
  showToolDescriptions,
}) => {
  const mcpServerCount = Object.keys(mcpServers || {}).length;

  if (contextFileCount === 0 && mcpServerCount === 0) { // Renamed
    return <Text> </Text>; // Render an empty space to reserve height
  }

  const contextFileText = (() => { // Renamed
    if (contextFileCount === 0) { // Renamed
      return '';
    }
    const allNamesTheSame = new Set(contextFileNames).size < 2;
    const name = allNamesTheSame ? contextFileNames[0] : 'context';
    return `${contextFileCount} ${name} file${ // Renamed
      contextFileCount > 1 ? 's' : '' // Renamed
    }`;
  })();

  const mcpText =
    mcpServerCount > 0
      ? `${mcpServerCount} MCP server${mcpServerCount > 1 ? 's' : ''}`
      : '';

  let summaryText = 'Using ';
  if (contextFileText) { // Renamed
    summaryText += contextFileText; // Renamed
  }
  if (contextFileText && mcpText) { // Renamed
    summaryText += ' and ';
  }
  if (mcpText) {
    summaryText += mcpText;
    // Add ctrl+t hint when MCP servers are available
    if (mcpServers && Object.keys(mcpServers).length > 0) {
      if (showToolDescriptions) {
        summaryText += ' (ctrl+t to toggle)';
      } else {
        summaryText += ' (ctrl+t to view)';
      }
    }
  }

  return <Text color={Colors.Gray}>{summaryText}</Text>;
};
