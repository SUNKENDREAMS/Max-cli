#!/usr/bin/env node

/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { execSync } from 'child_process';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

const projectRoot = join(import.meta.dirname, '..');

const SETTINGS_DIRECTORY_NAME = '.max_headroom'; // Renamed
const USER_SETTINGS_DIR = join(
  process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH || '',
  SETTINGS_DIRECTORY_NAME,
);
const USER_SETTINGS_PATH = join(USER_SETTINGS_DIR, 'settings.json');
const WORKSPACE_SETTINGS_PATH = join(
  projectRoot,
  SETTINGS_DIRECTORY_NAME,
  'settings.json',
);

let settingsTarget = undefined;

function loadSettingsValue(filePath) {
  try {
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8');
      const jsonContent = content.replace(/\/\/[^\n]*/g, '');
      const settings = JSON.parse(jsonContent);
      return settings.telemetry?.target;
    }
  } catch (e) {
    console.warn(
      `⚠️ Warning: Could not parse settings file at ${filePath}: ${e.message}`,
    );
  }
  return undefined;
}

settingsTarget = loadSettingsValue(WORKSPACE_SETTINGS_PATH);

if (!settingsTarget) {
  settingsTarget = loadSettingsValue(USER_SETTINGS_PATH);
}

let target = settingsTarget || 'local';
const allowedTargets = ['local']; // GCP removed

const targetArg = process.argv.find((arg) => arg.startsWith('--target='));
if (targetArg) {
  const potentialTarget = targetArg.split('=')[1];
  if (allowedTargets.includes(potentialTarget)) {
    target = potentialTarget;
    console.log(`⚙️  Using command-line target: ${target}`);
  } else {
    console.error(
      `🛑 Error: Invalid target '${potentialTarget}'. Allowed target is: 'local'. GCP target has been removed for offline focus.`,
    );
    process.exit(1);
  }
} else if (settingsTarget && settingsTarget !== 'gcp') {
  console.log(
    `⚙️ Using telemetry target from settings.json: ${settingsTarget}`,
  );
} else if (settingsTarget === 'gcp') {
  console.warn(
    `⚠️ Warning: Telemetry target 'gcp' found in settings.json but is not supported for this offline version. Defaulting to 'local'.`
  );
  target = 'local';
}


if (target !== 'local') {
  console.error(
    `🛑 Error: Telemetry target '${target}' is not supported in this version. Only 'local' is allowed.`
  );
  process.exit(1);
}

const scriptPath = join(
  projectRoot,
  'scripts',
  'local_telemetry.js', // Always use local_telemetry.js
);

try {
  console.log(`🚀 Running local telemetry script...`); // Updated message
  execSync(`node ${scriptPath}`, { stdio: 'inherit', cwd: projectRoot });
} catch (error) {
  console.error(`🛑 Failed to run local telemetry script.`);
  console.error(error);
  process.exit(1);
}
