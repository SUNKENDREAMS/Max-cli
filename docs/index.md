# Welcome to Max Headroom documentation

This documentation provides a comprehensive guide to installing, using, and developing Max Headroom. This tool lets you interact with AI models (like local Ollama models or optionally Google's Gemini) through a command-line interface.

## Overview

Max Headroom brings the capabilities of AI models to your terminal in an interactive Read-Eval-Print Loop (REPL) environment. Max Headroom consists of a client-side application (`packages/cli`) that communicates with a local server (`packages/core`), which in turn manages requests to the configured AI model's API. Max Headroom also contains a variety of tools for tasks such as performing file system operations, running shells, and web fetching (if applicable in your environment), which are managed by `packages/core`.

## Navigating the documentation

This documentation is organized into the following sections:

- **[Execution and Deployment](./deployment.md):** Information for running Max Headroom.
- **[Architecture Overview](./architecture.md):** Understand the high-level design of Max Headroom, including its components and how they interact.
- **CLI Usage:** Documentation for `packages/cli`.
  - **[CLI Introduction](./cli/index.md):** Overview of the command-line interface.
  - **[Commands](./cli/commands.md):** Description of available CLI commands.
  - **[Configuration](./cli/configuration.md):** Information on configuring the CLI. This includes details on `MAX_HEADROOM.md` files for context.
  - **[Checkpointing](./checkpointing.md):** Documentation for the checkpointing feature.
  - **[Extensions](./extension.md):** How to extend the CLI with new functionality.
  - **[Telemetry](./telemetry.md):** Overview of telemetry in the CLI (likely disabled in closed environments).
- **Core Details:** Documentation for `packages/core`.
  - **[Core Introduction](./core/index.md):** Overview of the core component.
  - **[Tools API](./core/tools-api.md):** Information on how the core manages and exposes tools.
- **Tools:**
  - **[Tools Overview](./tools/index.md):** Overview of the available tools.
  - **[File System Tools](./tools/file-system.md):** Documentation for the `read_file` and `write_file` tools.
  - **[Multi-File Read Tool](./tools/multi-file.md):** Documentation for the `read_many_files` tool.
  - **[Shell Tool](./tools/shell.md):** Documentation for the `run_shell_command` tool.
  - **[Web Fetch Tool](./tools/web-fetch.md):** Documentation for the `web_fetch` tool (consider if viable in a closed environment).
  - **[Web Search Tool](./tools/web-search.md):** Documentation for the `google_web_search` tool (consider if viable and if to be kept or replaced for offline use).
  - **[Memory Tool](./tools/memory.md):** Documentation for the `save_memory` tool.
- **[Contributing & Development Guide](../CONTRIBUTING.md):** Information for contributors and developers, including setup, building, testing, and coding conventions for Max Headroom.
- **[Troubleshooting Guide](./troubleshooting.md):** Find solutions to common problems and FAQs.
- **[Terms of Service and Privacy Notice](./tos-privacy.md):** Information on the terms of service and privacy notices (may need adjustment for offline use).

We hope this documentation helps you make the most of Max Headroom!
