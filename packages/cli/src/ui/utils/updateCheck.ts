/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import updateNotifier from 'update-notifier';
import { getPackageJson } from '../../utils/package.js';

export async function checkForUpdates(): Promise<string | null> {
  try {
    const packageJson = await getPackageJson();
    if (!packageJson || !packageJson.name || !packageJson.version) {
      return null;
    }
    const notifier = updateNotifier({
      pkg: {
        name: packageJson.name,
        version: packageJson.version,
      },
      // check every time
      updateCheckInterval: 0,
      // allow notifier to run in scripts
      shouldNotifyInNpmScript: true,
    });

    if (notifier.update) {
      // For offline APEN environment, update check against public npm might not be desired or possible.
      // This logic should ideally be disabled or configured to check an internal registry if one exists.
      console.warn("Update check is configured to check public npm registry. This may not work or be desired in the APEN environment.");
      return `Max Headroom CLI update available! ${notifier.update.current} → ${notifier.update.latest}\nRun npm install -g ${packageJson.name} to update (from your configured registry).`;
    }

    return null;
  } catch (e) {
    console.warn('Failed to check for updates: ' + e);
    return null;
  }
}
