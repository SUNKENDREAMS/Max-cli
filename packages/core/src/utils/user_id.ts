/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { MAX_HEADROOM_DIR } from './paths.js'; // Renamed

const homeDir = os.homedir() ?? '';
const maxHeadroomDir = path.join(homeDir, MAX_HEADROOM_DIR); // Renamed
const userIdFile = path.join(maxHeadroomDir, 'user_id'); // Renamed

function ensureMaxHeadroomDirExists() { // Renamed
  if (!fs.existsSync(maxHeadroomDir)) { // Renamed
    fs.mkdirSync(maxHeadroomDir, { recursive: true }); // Renamed
  }
}

function readUserIdFromFile(): string | null {
  if (fs.existsSync(userIdFile)) {
    const userId = fs.readFileSync(userIdFile, 'utf-8').trim();
    return userId || null;
  }
  return null;
}

function writeUserIdToFile(userId: string) {
  fs.writeFileSync(userIdFile, userId, 'utf-8');
}

/**
 * Retrieves the persistent user ID from a file, creating it if it doesn't exist.
 * This ID is used for unique user tracking.
 * @returns A UUID string for the user.
 */
export function getPersistentUserId(): string {
  try {
    ensureMaxHeadroomDirExists(); // Renamed
    let userId = readUserIdFromFile();

    if (!userId) {
      userId = randomUUID();
      writeUserIdToFile(userId);
    }

    return userId;
  } catch (error) {
    console.error(
      'Error accessing persistent user ID file, generating ephemeral ID:',
      error,
    );
    return '123456789';
  }
}
