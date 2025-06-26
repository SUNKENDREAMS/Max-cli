/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  EXTENSIONS_CONFIG_FILENAME,
  EXTENSIONS_DIRECTORY_NAME,
  loadExtensions,
} from './extension.js';

vi.mock('os', async (importOriginal) => {
  const os = await importOriginal<typeof import('os')>();
  return {
    ...os,
    homedir: vi.fn(),
  };
});

describe('loadExtensions', () => {
  let tempWorkspaceDir: string;
  let tempHomeDir: string;

  beforeEach(() => {
    tempWorkspaceDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'max-headroom-cli-test-workspace-'), // Renamed
    );
    tempHomeDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'max-headroom-cli-test-home-'), // Renamed
    );
    vi.mocked(os.homedir).mockReturnValue(tempHomeDir);
  });

  afterEach(() => {
    fs.rmSync(tempWorkspaceDir, { recursive: true, force: true });
    fs.rmSync(tempHomeDir, { recursive: true, force: true });
  });

  it('should load context file path when MAX_HEADROOM.md is present', () => { // Renamed test description
    const workspaceExtensionsDir = path.join(
      tempWorkspaceDir,
      EXTENSIONS_DIRECTORY_NAME,
    );
    fs.mkdirSync(workspaceExtensionsDir, { recursive: true });
    createExtension(workspaceExtensionsDir, 'ext1', '1.0.0', true, 'MAX_HEADROOM.md'); // Pass new default
    createExtension(workspaceExtensionsDir, 'ext2', '2.0.0');

    const extensions = loadExtensions(tempWorkspaceDir);

    expect(extensions).toHaveLength(2);
    const ext1 = extensions.find((e) => e.config.name === 'ext1');
    const ext2 = extensions.find((e) => e.config.name === 'ext2');
    expect(ext1?.contextFiles).toEqual([
      path.join(workspaceExtensionsDir, 'ext1', 'MAX_HEADROOM.md'), // Renamed
    ]);
    expect(ext2?.contextFiles).toEqual([]);
  });

  it('should load context file path from the extension config', () => {
    const workspaceExtensionsDir = path.join(
      tempWorkspaceDir,
      EXTENSIONS_DIRECTORY_NAME,
    );
    fs.mkdirSync(workspaceExtensionsDir, { recursive: true });
    createExtension(
      workspaceExtensionsDir,
      'ext1',
      '1.0.0',
      false,
      'my-context-file.md',
    );

    const extensions = loadExtensions(tempWorkspaceDir);

    expect(extensions).toHaveLength(1);
    const ext1 = extensions.find((e) => e.config.name === 'ext1');
    expect(ext1?.contextFiles).toEqual([
      path.join(workspaceExtensionsDir, 'ext1', 'my-context-file.md'),
    ]);
  });
});

function createExtension(
  extensionsDir: string,
  name: string,
  version: string,
  addContextFile = false,
  contextFileName?: string,
): void {
  const extDir = path.join(extensionsDir, name);
  fs.mkdirSync(extDir);
  fs.writeFileSync(
    path.join(extDir, EXTENSIONS_CONFIG_FILENAME),
    JSON.stringify({ name, version, contextFileName }),
  );

  if (addContextFile && contextFileName === 'MAX_HEADROOM.md') { // Ensure we use the new default if specified by test
    fs.writeFileSync(path.join(extDir, 'MAX_HEADROOM.md'), 'context');
  } else if (addContextFile && !contextFileName) { // If old test calls it without specifying filename
     fs.writeFileSync(path.join(extDir, 'MAX_HEADROOM.md'), 'context');
  }


  if (contextFileName && contextFileName !== 'MAX_HEADROOM.md') { // If a custom one is given, different from new default
    fs.writeFileSync(path.join(extDir, contextFileName), 'context');
  }
}
