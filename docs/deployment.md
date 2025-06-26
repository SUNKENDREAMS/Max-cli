# Max Headroom Execution and Deployment

This document describes how to run Max Headroom and explains its deployment architecture, focusing on its use in a closed, restricted environment.

## Running Max Headroom

There are several ways to run Max Headroom. The option you choose depends on how you intend to use it.

---

### 1. Standard installation (Recommended for typical users in the closed environment)

This is the recommended way for end-users to install Max Headroom within the restricted environment. It involves obtaining the Max Headroom package from your internal artifact repository or a shared location.

- **Global install (from local/internal registry/tarball):**

  ```bash
  # Example: Install the CLI globally from a tarball
  npm install -g ./max-headroom-cli-vX.Y.Z.tgz

  # Now you can run the CLI from anywhere
  max-headroom
  ```
  Or, if using a private npm registry:
  ```bash
  # Configure npm to use your private registry
  npm config set registry http://your-internal-npm-registry.local
  npm install -g max-headroom-cli

  # Now you can run the CLI from anywhere
  max-headroom
  ```

- **NPX execution (if applicable in your environment):**
  If your environment supports `npx` with a local or internal package source:
  ```bash
  # Execute from a local path or internal registry
  npx /path/to/max-headroom-cli # or npx max-headroom-cli if private registry is configured
  ```

---

### 2. Running in a sandbox (Docker/Podman - if available in the closed environment)

For security and isolation, Max Headroom can be run inside a container if your environment supports Docker or Podman. This is the default way that the CLI executes tools that might have side effects.

- **Directly from a local/internal Registry:**
  You can run a pre-built sandbox image from your internal container registry.
  ```bash
  # Run the sandbox image from your internal registry
  docker run --rm -it your-internal-registry.local/max-headroom-sandbox:X.Y.Z
  ```
- **Using the `--sandbox` flag:**
  If you have Max Headroom installed locally, you can instruct it to run inside the sandbox container (assuming the image is accessible).
  ```bash
  max-headroom --sandbox "your prompt here"
  ```

---

### 3. Running from source (Recommended for Max Headroom contributors/developers)

Contributors to the project will want to run the CLI directly from the source code.

- **Development Mode:**
  This method is useful for active development.
  ```bash
  # From the root of the repository
  npm run start
  ```
- **Production-like mode (Linked package):**
  This method simulates a global installation by linking your local package.

  ```bash
  # Link the local cli package to your global node_modules
  npm link packages/cli

  # Now you can run your local version using the `max-headroom` command
  max-headroom
  ```

---

## Deployment architecture (for closed environment)

The execution methods described above are made possible by the following architectural components and processes:

**NPM packages**

The Max Headroom project is a monorepo that produces packages:

- `max-headroom-core` (or similar, if packaged separately): The backend, handling logic and tool execution.
- `max-headroom-cli`: The user-facing frontend.

These packages are intended for distribution within your closed environment, e.g., via an internal npm registry or as tarballs.

**Build and packaging processes**

- **Local/Internal Publication:** The TypeScript source code is transpiled into standard JavaScript. The `npm run bundle` script uses `esbuild` to bundle the entire application into a single, self-contained JavaScript file (`bundle/max-headroom.js`). This bundled version is what you would distribute.

**Docker sandbox image (if used)**

If using containerized sandboxing:
- The `max-headroom-sandbox` container image is built from a Dockerfile.
- This image should be pushed to and pulled from your internal container registry.
- The `scripts/prepare-cli-packagejson.js` script might need adjustment to refer to your internal sandbox image URI if this was previously dynamic.

## Release process (for closed environment)

A script, potentially based on `npm run publish:release`, can orchestrate the release process for your internal environment. This would typically involve:

1.  Build the NPM packages.
2.  (If using sandbox) Build and tag the `max-headroom-sandbox` Docker image.
3.  (If using sandbox) Push the Docker image to your internal container registry.
4.  Publish/distribute the `max-headroom-cli` npm package to your internal npm registry or package it as a tarball for manual distribution.

This deployment strategy ensures that Max Headroom is installable and runnable within your restricted environment, with its dependencies bundled.
