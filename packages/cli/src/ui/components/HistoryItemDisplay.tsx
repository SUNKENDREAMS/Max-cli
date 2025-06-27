/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type { HistoryItem } from '../types.js';
import { UserMessage } from './messages/UserMessage.js';
import { UserShellMessage } from './messages/UserShellMessage.js';
import { AIMessage } from './messages/AIMessage.js'; // Renamed
import { InfoMessage } from './messages/InfoMessage.js';
import { ErrorMessage } from './messages/ErrorMessage.js';
import { ToolGroupMessage } from './messages/ToolGroupMessage.js';
import { AIMessageContent } from './messages/AIMessageContent.js'; // Renamed
import { CompressionMessage } from './messages/CompressionMessage.js';
import { Box } from 'ink';
import { AboutBox } from './AboutBox.js';
import { StatsDisplay } from './StatsDisplay.js';
import { SessionSummaryDisplay } from './SessionSummaryDisplay.js';
import { Config } from 'max-headroom-cli-core'; // Renamed

interface HistoryItemDisplayProps {
  item: HistoryItem;
  availableTerminalHeight?: number;
  terminalWidth: number;
  isPending: boolean;
  config?: Config;
  isFocused?: boolean;
}

export const HistoryItemDisplay: React.FC<HistoryItemDisplayProps> = ({
  item,
  availableTerminalHeight,
  terminalWidth,
  isPending,
  config,
  isFocused = true,
}) => (
  <Box flexDirection="column" key={item.id}>
    {/* Render standard message types */}
    {item.type === 'user' && <UserMessage text={item.text} />}
    {item.type === 'user_shell' && <UserShellMessage text={item.text} />}
    {item.type === 'ai' && ( // Renamed from 'gemini'
      <AIMessage
        text={item.text}
        isPending={isPending}
        availableTerminalHeight={availableTerminalHeight}
        terminalWidth={terminalWidth}
      />
    )}
    {item.type === 'ai_content' && ( // Renamed from 'gemini_content'
      <AIMessageContent
        text={item.text}
        isPending={isPending}
        availableTerminalHeight={availableTerminalHeight}
        terminalWidth={terminalWidth}
      />
    )}
    {item.type === 'info' && <InfoMessage text={item.text} />}
    {item.type === 'error' && <ErrorMessage text={item.text} />}
    {item.type === 'about' && (
      <AboutBox
        cliVersion={item.cliVersion}
        osVersion={item.osVersion}
        sandboxEnv={item.sandboxEnv}
        modelVersion={item.modelVersion}
      />
    )}
    {item.type === 'stats' && (
      <StatsDisplay
        stats={item.stats}
        lastTurnStats={item.lastTurnStats}
        duration={item.duration}
      />
    )}
    {item.type === 'quit' && (
      <SessionSummaryDisplay stats={item.stats} duration={item.duration} />
    )}
    {item.type === 'tool_group' && (
      <ToolGroupMessage
        toolCalls={item.tools}
        groupId={item.id}
        availableTerminalHeight={availableTerminalHeight}
        terminalWidth={terminalWidth}
        config={config}
        isFocused={isFocused}
      />
    )}
    {item.type === 'compression' && (
      <CompressionMessage compression={item.compression} />
    )}
  </Box>
);
