/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { vi, describe, it, expect, beforeEach, Mocked } from 'vitest';
import * as fsPromises from 'fs/promises';
import * as fsSync from 'fs';
import { Stats, Dirent } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { loadServerHierarchicalMemory } from './memoryDiscovery.js';
import {
  MAX_HEADROOM_CONFIG_DIR, // Renamed
  setMaxHeadroomMdFilename, // Renamed
  getCurrentMaxHeadroomMdFilename, // Renamed
  DEFAULT_CONTEXT_FILENAME, // This constant itself in memoryTool.ts was already updated to MAX_HEADROOM.md
} from '../tools/memoryTool.js';
import { FileDiscoveryService } from '../services/fileDiscoveryService.js';

const ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST = DEFAULT_CONTEXT_FILENAME; // Renamed variable

// Mock the entire fs/promises module
vi.mock('fs/promises');
// Mock the parts of fsSync we might use (like constants or existsSync if needed)
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof fsSync>();
  return {
    ...actual, // Spread actual to get all exports, including Stats and Dirent if they are classes/constructors
    constants: { ...actual.constants }, // Preserve constants
  };
});
vi.mock('os');

describe('loadServerHierarchicalMemory', () => {
  const mockFs = fsPromises as Mocked<typeof fsPromises>;
  const mockOs = os as Mocked<typeof os>;

  const CWD = '/test/project/src';
  const PROJECT_ROOT = '/test/project';
  const USER_HOME = '/test/userhome';

  let GLOBAL_MAX_HEADROOM_DIR: string; // Renamed
  let GLOBAL_CONTEXT_FILE: string; // Renamed & made generic

  const fileService = new FileDiscoveryService(PROJECT_ROOT);
  beforeEach(() => {
    vi.resetAllMocks();
    // Set environment variables to indicate test environment
    process.env.NODE_ENV = 'test';
    process.env.VITEST = 'true';

    setMaxHeadroomMdFilename(DEFAULT_CONTEXT_FILENAME); // Use renamed function
    mockOs.homedir.mockReturnValue(USER_HOME);

    // Define these here to use potentially reset/updated values from imports
    GLOBAL_MAX_HEADROOM_DIR = path.join(USER_HOME, MAX_HEADROOM_CONFIG_DIR); // Renamed
    GLOBAL_CONTEXT_FILE = path.join( // Renamed
      GLOBAL_MAX_HEADROOM_DIR, // Renamed
      getCurrentMaxHeadroomMdFilename(), // Use renamed function
    );

    mockFs.stat.mockRejectedValue(new Error('File not found'));
    mockFs.readdir.mockResolvedValue([]);
    mockFs.readFile.mockRejectedValue(new Error('File not found'));
    mockFs.access.mockRejectedValue(new Error('File not found'));
  });

  it('should return empty memory and count if no context files are found', async () => {
    const { memoryContent, fileCount } = await loadServerHierarchicalMemory(
      CWD,
      false,
      fileService,
    );
    expect(memoryContent).toBe('');
    expect(fileCount).toBe(0);
  });

  it('should load only the global context file if present and others are not (default filename)', async () => {
    // GLOBAL_CONTEXT_FILE is already defined using getCurrentMaxHeadroomMdFilename which uses DEFAULT_CONTEXT_FILENAME (MAX_HEADROOM.md)
    mockFs.access.mockImplementation(async (p) => {
      if (p === GLOBAL_CONTEXT_FILE) { // Use updated global var
        return undefined;
      }
      throw new Error('File not found');
    });
    mockFs.readFile.mockImplementation(async (p) => {
      if (p === GLOBAL_CONTEXT_FILE) { // Use updated global var
        return 'Global memory content';
      }
      throw new Error('File not found');
    });

    const { memoryContent, fileCount } = await loadServerHierarchicalMemory(
      CWD,
      false,
      fileService,
    );

    expect(memoryContent).toBe(
      `--- Context from: ${path.relative(CWD, GLOBAL_CONTEXT_FILE)} ---\nGlobal memory content\n--- End of Context from: ${path.relative(CWD, GLOBAL_CONTEXT_FILE)} ---`,
    );
    expect(fileCount).toBe(1);
    expect(mockFs.readFile).toHaveBeenCalledWith(GLOBAL_CONTEXT_FILE, 'utf-8'); // Use updated global var
  });

  it('should load only the global custom context file if present and filename is changed', async () => {
    const customFilename = 'CUSTOM_AGENTS.md';
    setMaxHeadroomMdFilename(customFilename); // Renamed function
    const globalCustomFile = path.join(GLOBAL_MAX_HEADROOM_DIR, customFilename); // Renamed dir

    mockFs.access.mockImplementation(async (p) => {
      if (p === globalCustomFile) {
        return undefined;
      }
      throw new Error('File not found');
    });
    mockFs.readFile.mockImplementation(async (p) => {
      if (p === globalCustomFile) {
        return 'Global custom memory';
      }
      throw new Error('File not found');
    });

    const { memoryContent, fileCount } = await loadServerHierarchicalMemory(
      CWD,
      false,
      fileService,
    );

    expect(memoryContent).toBe(
      `--- Context from: ${path.relative(CWD, globalCustomFile)} ---\nGlobal custom memory\n--- End of Context from: ${path.relative(CWD, globalCustomFile)} ---`,
    );
    expect(fileCount).toBe(1);
    expect(mockFs.readFile).toHaveBeenCalledWith(globalCustomFile, 'utf-8');
  });

  it('should load context files by upward traversal with custom filename', async () => {
    const customFilename = 'PROJECT_CONTEXT.md';
    setMaxHeadroomMdFilename(customFilename); // Renamed
    const projectRootCustomFile = path.join(PROJECT_ROOT, customFilename);
    const srcCustomFile = path.join(CWD, customFilename);

    mockFs.stat.mockImplementation(async (p) => {
      if (p === path.join(PROJECT_ROOT, '.git')) {
        return { isDirectory: () => true } as Stats;
      }
      throw new Error('File not found');
    });

    mockFs.access.mockImplementation(async (p) => {
      if (p === projectRootCustomFile || p === srcCustomFile) {
        return undefined;
      }
      throw new Error('File not found');
    });

    mockFs.readFile.mockImplementation(async (p) => {
      if (p === projectRootCustomFile) {
        return 'Project root custom memory';
      }
      if (p === srcCustomFile) {
        return 'Src directory custom memory';
      }
      throw new Error('File not found');
    });

    const { memoryContent, fileCount } = await loadServerHierarchicalMemory(
      CWD,
      false,
      fileService,
    );
    const expectedContent =
      `--- Context from: ${path.relative(CWD, projectRootCustomFile)} ---\nProject root custom memory\n--- End of Context from: ${path.relative(CWD, projectRootCustomFile)} ---\n\n` +
      `--- Context from: ${customFilename} ---\nSrc directory custom memory\n--- End of Context from: ${customFilename} ---`;

    expect(memoryContent).toBe(expectedContent);
    expect(fileCount).toBe(2);
    expect(mockFs.readFile).toHaveBeenCalledWith(
      projectRootCustomFile,
      'utf-8',
    );
    expect(mockFs.readFile).toHaveBeenCalledWith(srcCustomFile, 'utf-8');
  });

  it('should load context files by downward traversal with custom filename', async () => {
    const customFilename = 'LOCAL_CONTEXT.md';
    setMaxHeadroomMdFilename(customFilename); // Renamed
    const subDir = path.join(CWD, 'subdir');
    const subDirCustomFile = path.join(subDir, customFilename);
    const cwdCustomFile = path.join(CWD, customFilename);

    mockFs.access.mockImplementation(async (p) => {
      if (p === cwdCustomFile || p === subDirCustomFile) return undefined;
      throw new Error('File not found');
    });

    mockFs.readFile.mockImplementation(async (p) => {
      if (p === cwdCustomFile) return 'CWD custom memory';
      if (p === subDirCustomFile) return 'Subdir custom memory';
      throw new Error('File not found');
    });

    mockFs.readdir.mockImplementation((async (
      p: fsSync.PathLike,
    ): Promise<Dirent[]> => {
      if (p === CWD) {
        return [
          {
            name: customFilename,
            isFile: () => true,
            isDirectory: () => false,
          } as Dirent,
          {
            name: 'subdir',
            isFile: () => false,
            isDirectory: () => true,
          } as Dirent,
        ] as Dirent[];
      }
      if (p === subDir) {
        return [
          {
            name: customFilename,
            isFile: () => true,
            isDirectory: () => false,
          } as Dirent,
        ] as Dirent[];
      }
      return [] as Dirent[];
    }) as unknown as typeof fsPromises.readdir);

    const { memoryContent, fileCount } = await loadServerHierarchicalMemory(
      CWD,
      false,
      fileService,
    );
    const expectedContent =
      `--- Context from: ${customFilename} ---\nCWD custom memory\n--- End of Context from: ${customFilename} ---\n\n` +
      `--- Context from: ${path.join('subdir', customFilename)} ---\nSubdir custom memory\n--- End of Context from: ${path.join('subdir', customFilename)} ---`;

    expect(memoryContent).toBe(expectedContent);
    expect(fileCount).toBe(2);
  });

  it('should load MAX_HEADROOM.md files by upward traversal from CWD to project root', async () => { // Renamed test description
    const projectRootContextFile = path.join( // Renamed variable
      PROJECT_ROOT,
      ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST, // Renamed variable
    );
    const srcContextFile = path.join( // Renamed variable
      CWD,
      ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST, // Renamed variable
    );

    mockFs.stat.mockImplementation(async (p) => {
      if (p === path.join(PROJECT_ROOT, '.git')) {
        return { isDirectory: () => true } as Stats;
      }
      throw new Error('File not found');
    });

    mockFs.access.mockImplementation(async (p) => {
      if (p === projectRootContextFile || p === srcContextFile) { // Renamed variables
        return undefined;
      }
      throw new Error('File not found');
    });

    mockFs.readFile.mockImplementation(async (p) => {
      if (p === projectRootContextFile) { // Renamed variable
        return 'Project root memory';
      }
      if (p === srcContextFile) { // Renamed variable
        return 'Src directory memory';
      }
      throw new Error('File not found');
    });

    const { memoryContent, fileCount } = await loadServerHierarchicalMemory(
      CWD,
      false,
      fileService,
    );
    const expectedContent =
      `--- Context from: ${path.relative(CWD, projectRootContextFile)} ---\nProject root memory\n--- End of Context from: ${path.relative(CWD, projectRootContextFile)} ---\n\n` + // Renamed
      `--- Context from: ${ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST} ---\nSrc directory memory\n--- End of Context from: ${ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST} ---`; // Renamed

    expect(memoryContent).toBe(expectedContent);
    expect(fileCount).toBe(2);
    expect(mockFs.readFile).toHaveBeenCalledWith(
      projectRootContextFile, // Renamed
      'utf-8',
    );
    expect(mockFs.readFile).toHaveBeenCalledWith(srcContextFile, 'utf-8'); // Renamed
  });

  it('should load MAX_HEADROOM.md files by downward traversal from CWD', async () => { // Renamed test description
    const subDir = path.join(CWD, 'subdir');
    const subDirContextFile = path.join( // Renamed
      subDir,
      ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST, // Renamed
    );
    const cwdContextFile = path.join( // Renamed
      CWD,
      ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST, // Renamed
    );

    mockFs.access.mockImplementation(async (p) => {
      if (p === cwdContextFile || p === subDirContextFile) return undefined; // Renamed
      throw new Error('File not found');
    });

    mockFs.readFile.mockImplementation(async (p) => {
      if (p === cwdContextFile) return 'CWD memory'; // Renamed
      if (p === subDirContextFile) return 'Subdir memory'; // Renamed
      throw new Error('File not found');
    });

    mockFs.readdir.mockImplementation((async (
      p: fsSync.PathLike,
    ): Promise<Dirent[]> => {
      if (p === CWD) {
        return [
          {
            name: ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST, // Renamed
            isFile: () => true,
            isDirectory: () => false,
          } as Dirent,
          {
            name: 'subdir',
            isFile: () => false,
            isDirectory: () => true,
          } as Dirent,
        ] as Dirent[];
      }
      if (p === subDir) {
        return [
          {
            name: ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST, // Renamed
            isFile: () => true,
            isDirectory: () => false,
          } as Dirent,
        ] as Dirent[];
      }
      return [] as Dirent[];
    }) as unknown as typeof fsPromises.readdir);

    const { memoryContent, fileCount } = await loadServerHierarchicalMemory(
      CWD,
      false,
      fileService,
    );
    const expectedContent =
      `--- Context from: ${ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST} ---\nCWD memory\n--- End of Context from: ${ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST} ---\n\n` + // Renamed
      `--- Context from: ${path.join('subdir', ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST)} ---\nSubdir memory\n--- End of Context from: ${path.join('subdir', ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST)} ---`; // Renamed

    expect(memoryContent).toBe(expectedContent);
    expect(fileCount).toBe(2);
  });

  it('should load and correctly order global, upward, and downward MAX_HEADROOM.md files', async () => { // Renamed test description
    setMaxHeadroomMdFilename(ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST); // Renamed function, Renamed variable

    const globalFileToUse = path.join(
      GLOBAL_MAX_HEADROOM_DIR, // Renamed
      ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST, // Renamed
    );
    const projectParentDir = path.dirname(PROJECT_ROOT);
    const projectParentContextFile = path.join( // Renamed
      projectParentDir,
      ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST, // Renamed
    );
    const projectRootContextFile = path.join( // Renamed
      PROJECT_ROOT,
      ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST, // Renamed
    );
    const cwdContextFile = path.join( // Renamed
      CWD,
      ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST, // Renamed
    );
    const subDir = path.join(CWD, 'sub');
    const subDirContextFile = path.join( // Renamed
      subDir,
      ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST, // Renamed
    );

    mockFs.stat.mockImplementation(async (p) => {
      if (p === path.join(PROJECT_ROOT, '.git')) {
        return { isDirectory: () => true } as Stats;
      } else if (p === path.join(PROJECT_ROOT, MAX_HEADROOM_CONFIG_DIR)) { // Renamed
        return { isDirectory: () => true } as Stats;
      }
      throw new Error('File not found');
    });

    mockFs.access.mockImplementation(async (p) => {
      if (
        p === globalFileToUse ||
        p === projectParentContextFile || // Renamed
        p === projectRootContextFile || // Renamed
        p === cwdContextFile || // Renamed
        p === subDirContextFile // Renamed
      ) {
        return undefined;
      }
      throw new Error('File not found');
    });

    mockFs.readFile.mockImplementation(async (p) => {
      if (p === globalFileToUse) return 'Global memory';
      if (p === projectParentContextFile) return 'Project parent memory'; // Renamed
      if (p === projectRootContextFile) return 'Project root memory'; // Renamed
      if (p === cwdContextFile) return 'CWD memory'; // Renamed
      if (p === subDirContextFile) return 'Subdir memory'; // Renamed
      throw new Error('File not found');
    });

    mockFs.readdir.mockImplementation((async (
      p: fsSync.PathLike,
    ): Promise<Dirent[]> => {
      if (p === CWD) {
        return [
          {
            name: 'sub',
            isFile: () => false,
            isDirectory: () => true,
          } as Dirent,
        ] as Dirent[];
      }
      if (p === subDir) {
        return [
          {
            name: ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST, // Renamed
            isFile: () => true,
            isDirectory: () => false,
          } as Dirent,
        ] as Dirent[];
      }
      return [] as Dirent[];
    }) as unknown as typeof fsPromises.readdir);

    const { memoryContent, fileCount } = await loadServerHierarchicalMemory(
      CWD,
      false,
      fileService,
    );

    const relPathGlobal = path.relative(CWD, GLOBAL_CONTEXT_FILE); // Renamed
    const relPathProjectParent = path.relative(CWD, projectParentContextFile); // Renamed
    const relPathProjectRoot = path.relative(CWD, projectRootContextFile); // Renamed
    const relPathCwd = ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST; // Renamed
    const relPathSubDir = path.join(
      'sub',
      ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST, // Renamed
    );

    const expectedContent = [
      `--- Context from: ${relPathGlobal} ---\nGlobal memory\n--- End of Context from: ${relPathGlobal} ---`,
      `--- Context from: ${relPathProjectParent} ---\nProject parent memory\n--- End of Context from: ${relPathProjectParent} ---`,
      `--- Context from: ${relPathProjectRoot} ---\nProject root memory\n--- End of Context from: ${relPathProjectRoot} ---`,
      `--- Context from: ${relPathCwd} ---\nCWD memory\n--- End of Context from: ${relPathCwd} ---`,
      `--- Context from: ${relPathSubDir} ---\nSubdir memory\n--- End of Context from: ${relPathSubDir} ---`,
    ].join('\n\n');

    expect(memoryContent).toBe(expectedContent);
    expect(fileCount).toBe(5);
  });

  it('should ignore specified directories during downward scan', async () => {
    const ignoredDir = path.join(CWD, 'node_modules');
    const ignoredDirContextFile = path.join( // Renamed
      ignoredDir,
      ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST, // Renamed
    );
    const regularSubDir = path.join(CWD, 'my_code');
    const regularSubDirContextFile = path.join( // Renamed
      regularSubDir,
      ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST, // Renamed
    );

    mockFs.access.mockImplementation(async (p) => {
      if (p === regularSubDirContextFile) return undefined; // Renamed
      if (p === ignoredDirContextFile) // Renamed
        throw new Error('Should not access ignored file');
      throw new Error('File not found');
    });

    mockFs.readFile.mockImplementation(async (p) => {
      if (p === regularSubDirContextFile) return 'My code memory'; // Renamed
      throw new Error('File not found');
    });

    mockFs.readdir.mockImplementation((async (
      p: fsSync.PathLike,
    ): Promise<Dirent[]> => {
      if (p === CWD) {
        return [
          {
            name: 'node_modules',
            isFile: () => false,
            isDirectory: () => true,
          } as Dirent,
          {
            name: 'my_code',
            isFile: () => false,
            isDirectory: () => true,
          } as Dirent,
        ] as Dirent[];
      }
      if (p === regularSubDir) {
        return [
          {
            name: ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST, // Renamed
            isFile: () => true,
            isDirectory: () => false,
          } as Dirent,
        ] as Dirent[];
      }
      if (p === ignoredDir) {
        return [] as Dirent[];
      }
      return [] as Dirent[];
    }) as unknown as typeof fsPromises.readdir);

    const { memoryContent, fileCount } = await loadServerHierarchicalMemory(
      CWD,
      false,
      fileService,
    );

    const expectedContent = `--- Context from: ${path.join('my_code', ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST)} ---\nMy code memory\n--- End of Context from: ${path.join('my_code', ORIGINAL_CONTEXT_MD_FILENAME_CONST_FOR_TEST)} ---`; // Renamed

    expect(memoryContent).toBe(expectedContent);
    expect(fileCount).toBe(1);
    expect(mockFs.readFile).not.toHaveBeenCalledWith(
      ignoredDirContextFile, // Renamed
      'utf-8',
    );
  });

  it('should respect MAX_DIRECTORIES_TO_SCAN_FOR_MEMORY during downward scan', async () => {
    const consoleDebugSpy = vi
      .spyOn(console, 'debug')
      .mockImplementation(() => {});

    const dirNames: Dirent[] = [];
    for (let i = 0; i < 250; i++) {
      dirNames.push({
        name: `deep_dir_${i}`,
        isFile: () => false,
        isDirectory: () => true,
      } as Dirent);
    }

    mockFs.readdir.mockImplementation((async (
      p: fsSync.PathLike,
    ): Promise<Dirent[]> => {
      if (p === CWD) return dirNames;
      if (p.toString().startsWith(path.join(CWD, 'deep_dir_')))
        return [] as Dirent[];
      return [] as Dirent[];
    }) as unknown as typeof fsPromises.readdir);
    mockFs.access.mockRejectedValue(new Error('not found'));

    await loadServerHierarchicalMemory(CWD, true, fileService);

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG] [BfsFileSearch]'),
      expect.stringContaining('Scanning [200/200]:'),
    );
    consoleDebugSpy.mockRestore();
  });

  it('should load extension context file paths', async () => {
    const extensionFilePath = '/test/extensions/ext1/MAX_HEADROOM.md'; // Renamed
    mockFs.access.mockImplementation(async (p) => {
      if (p === extensionFilePath) {
        return undefined;
      }
      throw new Error('File not found');
    });
    mockFs.readFile.mockImplementation(async (p) => {
      if (p === extensionFilePath) {
        return 'Extension memory content';
      }
      throw new Error('File not found');
    });

    const { memoryContent, fileCount } = await loadServerHierarchicalMemory(
      CWD,
      false,
      fileService,
      [extensionFilePath],
    );

    expect(memoryContent).toBe(
      `--- Context from: ${path.relative(CWD, extensionFilePath)} ---\nExtension memory content\n--- End of Context from: ${path.relative(CWD, extensionFilePath)} ---`,
    );
    expect(fileCount).toBe(1);
    expect(mockFs.readFile).toHaveBeenCalledWith(extensionFilePath, 'utf-8');
  });
});
