/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { getErrorMessage, isNodeError } from './errors.js';
import {
  getCurrentMaxHeadroomMdFilename, // Renamed
  getAllMaxHeadroomMdFilenames, // Renamed
  MAX_HEADROOM_CONFIG_DIR, // Renamed
} from '../tools/memoryTool.js';
import { FileDiscoveryService } from '../services/fileDiscoveryService.js';
import { Config } from '../config/config.js';

interface ContextFileContent { // Renamed
  filePath: string;
  content: string;
}

// Helper function to get the directory name for settings based on the config.
function getSettingsDirName(_config?: Config): string {
  return MAX_HEADROOM_CONFIG_DIR; // Use renamed const
}

/**
 * Searches for context files (e.g., MAX_HEADROOM.md) in a hierarchical manner:
 * 1. Global: `~/.max_headroom/<filename>`
 * 2. Project Root and Ancestors: Traverses up from `currentDir` to `rootDir`, looking in `.max_headroom/<filename>`.
 * 3. Subdirectories: Scans subdirectories under `currentDir` (respecting ignores).
 *
 * @param rootDir The absolute path to the project's root directory.
 * @param currentDir The absolute path to the current working directory.
 * @param debugMode Optional flag to enable debug logging.
 * @param fileService Optional FileDiscoveryService for testing or custom file operations.
 * @param config Optional Config object.
 * @returns An array of absolute paths to found context files, ordered by precedence (more specific last).
 */
async function getContextMdFilePathsInternal( // Renamed
  rootDir: string,
  currentDir: string,
  debugMode: boolean = false,
  fileService?: FileDiscoveryService,
  config?: Config,
): Promise<string[]> {
  const effectiveFileService = fileService || new FileDiscoveryService(rootDir);
  const paths: string[] = [];
  const foundPaths = new Set<string>();

  const settingsDirName = getSettingsDirName(config);
  const contextMdFilenames = getAllMaxHeadroomMdFilenames(); // Renamed function call

  const addPathIfFound = async (filePath: string) => {
    if (!foundPaths.has(filePath) && (await effectiveFileService.exists(filePath))) {
      paths.push(filePath);
      foundPaths.add(filePath);
      if (debugMode) console.log(`[MemoryDiscovery] Found context file: ${filePath}`);
    }
  };

  // 1. Global context file(s)
  for (const filename of contextMdFilenames) {
    const globalPath = path.join(os.homedir(), settingsDirName, filename);
    await addPathIfFound(globalPath);
  }

  // 2. Project Root and Ancestors (from currentDir up to rootDir)
  const searchUpTo = path.resolve(rootDir);
  let dir = path.resolve(currentDir);
  while (dir.startsWith(searchUpTo) || dir === searchUpTo) {
    for (const filename of contextMdFilenames) {
      const projectPath = path.join(dir, settingsDirName, filename);
      await addPathIfFound(projectPath);
    }
    if (dir === searchUpTo) break;
    const parentDir = path.dirname(dir);
    if (parentDir === dir) break;
    dir = parentDir;
  }

  // 3. Subdirectories under currentDir (if currentDir is within rootDir)
  if (currentDir.startsWith(searchUpTo)) {
    const subDirPatterns = contextMdFilenames.map(filename => `**/${settingsDirName}/${filename}`);
    try {
      const subDirFiles = await effectiveFileService.findFiles({
        patterns: subDirPatterns,
        baseDir: currentDir,
        respectGitIgnore: config?.getFileFilteringRespectGitIgnore() ?? true,
      });

      subDirFiles.sort((a, b) => {
        const depthA = a.split(path.sep).length;
        const depthB = b.split(path.sep).length;
        if (depthA !== depthB) {
          return depthA - depthB;
        }
        return a.localeCompare(b);
      });

      for (const file of subDirFiles) {
        await addPathIfFound(file);
      }
    } catch (error) {
      if (debugMode) console.error(`[MemoryDiscovery] Error scanning subdirectories: ${getErrorMessage(error)}`);
    }
  }
  if (debugMode) console.log(`[MemoryDiscovery] Final ordered ${getAllMaxHeadroomMdFilenames()} paths to read: ${JSON.stringify(paths, null, 2)}`); // Renamed function call
  return paths;
}


/**
 * Reads the content of context files from a list of paths.
 * @param filePaths An array of absolute paths to context files.
 * @param debugMode Optional flag to enable debug logging.
 * @returns A promise that resolves to an array of objects, each containing the filePath and its content.
 */
async function readContextMdFiles( // Renamed
  filePaths: string[],
  debugMode: boolean = false,
): Promise<ContextFileContent[]> { // Renamed
  const results: ContextFileContent[] = []; // Renamed
  for (const filePath of filePaths) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      results.push({ filePath, content });
      if (debugMode) console.log(`[MemoryDiscovery] Read content from: ${filePath}`);
    } catch (error) {
      const message = getErrorMessage(error);
      if (debugMode) {
        console.warn(
          `[MemoryDiscovery] Warning: Could not read ${getAllMaxHeadroomMdFilenames()} file at ${filePath}. Error: ${message}`, // Renamed function call
        );
      }
    }
  }
  return results;
}

/**
 * Concatenates the content of multiple context files with separators.
 * @param instructionContents An array of objects, each with filePath and content.
 * @returns A single string with all contents concatenated.
 */
function concatenateContextMdContent( // Renamed
  instructionContents: ContextFileContent[], // Renamed
  debugMode: boolean = false,
): string {
  if (debugMode) console.log(`[MemoryDiscovery] Concatenating ${instructionContents.length} context files.`);
  return instructionContents
    .map(item => `--- Context from: ${item.filePath} ---\n${item.content}`)
    .join('\n\n');
}


/**
 * Loads hierarchical memory from context files (e.g. MAX_HEADROOM.md).
 * The order of loading defines precedence: global, then project root/ancestors, then subdirectories.
 * More specific files (deeper paths or later in explicit `contextFileName` array) effectively override or supplement broader ones.
 */
export async function loadServerHierarchicalMemory(
  currentWorkingDirectory: string,
  debugMode: boolean,
  fileService: FileDiscoveryService,
  extensionContextFilePaths: string[] = [],
  config?: Config,
): Promise<{ memoryContent: string; fileCount: number }> {
  const projectRoot = fileService.getProjectRoot();
  const filePaths = await getContextMdFilePathsInternal( // Renamed
    projectRoot,
    currentWorkingDirectory,
    debugMode,
    fileService,
    config,
  );

  const validExtensionFiles: string[] = [];
  for (const extPath of extensionContextFilePaths) {
    const absPath = path.resolve(extPath);
    if (await fileService.exists(absPath) && !filePaths.includes(absPath)) {
      validExtensionFiles.push(absPath);
      if (debugMode) console.log(`[MemoryDiscovery] Adding extension context file: ${absPath}`);
    }
  }
  const allPaths = [...filePaths, ...validExtensionFiles];
  const uniquePaths = [...new Set(allPaths)];

  if (debugMode) console.log(`[MemoryDiscovery] All unique context file paths to load: ${JSON.stringify(uniquePaths, null, 2)}`);

  const contentsWithPaths = await readContextMdFiles(uniquePaths, debugMode); // Renamed
  const memoryContent = concatenateContextMdContent(contentsWithPaths, debugMode); // Renamed
  return { memoryContent, fileCount: contentsWithPaths.length };
}
