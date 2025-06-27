/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { execSync } from 'child_process';
import { chmodSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import cliPkgJson from '../packages/cli/package.json' with { type: 'json' };

const argv = yargs(hideBin(process.argv))
  .option('s', {
    alias: 'skip-npm-install-build',
    type: 'boolean',
    default: false,
    description: 'skip npm install + npm run build',
  })
  .option('f', {
    alias: 'dockerfile',
    type: 'string',
    description: 'use <dockerfile> for custom image',
  })
  .option('i', {
    alias: 'image',
    type: 'string',
    description: 'use <image> name for custom image',
  }).argv;

let sandboxCommand;
try {
  sandboxCommand = execSync('node scripts/sandbox_command.js')
    .toString()
    .trim();
} catch {
  console.warn('ERROR: could not detect sandbox container command');
  process.exit(0);
}

if (sandboxCommand === 'sandbox-exec') {
  console.warn(
    'WARNING: container-based sandboxing is disabled (see README.md#sandboxing)',
  );
  process.exit(0);
}

console.log(`using ${sandboxCommand} for sandboxing`);

// const baseImage = cliPkgJson.config.sandboxImageUri; // This was removed from package.json
const baseImage = undefined; // Explicitly undefined, or could be configured via another env var for internal registry
const customImage = argv.i;
const baseDockerfile = 'Dockerfile'; // This refers to the Dockerfile in the project root
const customDockerfile = argv.f;

if (!baseImage?.length && !customImage && !customDockerfile) { // Adjusted condition
  console.warn(
    'Warning: No base sandbox image URI was found (it was removed as a cloud dependency). ' +
    'Sandbox will only be built if a custom Dockerfile (-f) and image name (-i) are specified.',
  );
}

if (!argv.s) {
  execSync('npm install', { stdio: 'inherit' });
  execSync('npm run build --workspaces', { stdio: 'inherit' });
}

console.log('packing max-headroom-cli-app ...'); // Renamed
const cliPackageDir = join('packages', 'cli');
// Adjust glob to match new package name if npm pack output changes filename format
rmSync(join(cliPackageDir, 'dist', 'max-headroom-cli-app-*.tgz'), { force: true });
execSync(
  `npm pack -w max-headroom-cli-app --pack-destination ./packages/cli/dist`, // Renamed
  {
    stdio: 'ignore',
  },
);

console.log('packing max-headroom-cli-core ...'); // Renamed
const corePackageDir = join('packages', 'core');
// Adjust glob to match new package name
rmSync(join(corePackageDir, 'dist', 'max-headroom-cli-core-*.tgz'), {
  force: true,
});
execSync(
  `npm pack -w max-headroom-cli-core --pack-destination ./packages/core/dist`, // Renamed
  { stdio: 'ignore' },
);

const packageVersion = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8'),
).version;

// Filenames from npm pack are typically <name>-<version>.tgz
chmodSync(
  join(cliPackageDir, 'dist', `max-headroom-cli-app-${packageVersion}.tgz`), // Renamed
  0o755,
);
chmodSync(
  join(corePackageDir, 'dist', `max-headroom-cli-core-${packageVersion}.tgz`), // Renamed
  0o755,
);

const buildStdout = process.env.VERBOSE ? 'inherit' : 'ignore';

function buildImage(imageName, dockerfile) {
  console.log(`building ${imageName} ... (can be slow first time)`);
  const buildCommand =
    sandboxCommand === 'podman'
      ? `${sandboxCommand} build --authfile=<(echo '{}')`
      : `${sandboxCommand} build`;

  const npmPackageVersion = JSON.parse(
    readFileSync(join(process.cwd(), 'package.json'), 'utf-8'),
  ).version;

  execSync(
    `${buildCommand} ${
      process.env.BUILD_SANDBOX_FLAGS || ''
    } --build-arg CLI_VERSION_ARG=${npmPackageVersion} -f "${dockerfile}" -t "${imageName}" .`,
    { stdio: buildStdout, shell: '/bin/bash' },
  );
  console.log(`built ${imageName}`);
}

if (baseImage && baseDockerfile) {
  buildImage(baseImage, baseDockerfile);
}

if (customDockerfile && customImage) {
  buildImage(customImage, customDockerfile);
}

execSync(`${sandboxCommand} image prune -f`, { stdio: 'ignore' });
