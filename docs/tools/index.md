# Max Headroom tools

Max Headroom includes built-in tools that the AI model uses to interact with your local environment, access information, and perform actions. These tools enhance the CLI's capabilities, enabling it to go beyond text generation and assist with a wide range of tasks, particularly in offline or restricted environments.

## Overview of Max Headroom tools

In the context of Max Headroom, tools are specific functions or modules that the AI model can request to be executed. For example, if you ask Max Headroom to "Summarize the contents of `my_document.txt`," the model will likely identify the need to read that file and will request the execution of the `read_file` tool.

The core component (`packages/core`) manages these tools, presents their definitions (schemas) to the AI model, executes them when requested, and returns the results to the model for further processing into a user-facing response.

These tools provide the following capabilities:

- **Access local information:** Tools allow Max Headroom to access your local file system, read file contents, list directories, etc.
- **Execute commands:** With tools like `run_shell_command`, Max Headroom can run shell commands (with appropriate safety measures and user confirmation).
- **Interact with the web (conditionally):** Tools like `web_fetch` and `web_search` are available but will require local deployment or alternatives in a closed network.
- **Take actions:** Tools can modify files, write new files, or perform other actions on your system (again, typically with safeguards).
- **Ground responses:** By using tools to fetch real-time or specific local data, Max Headroom's responses can be more accurate, relevant, and grounded in your actual context.

## How to use Max Headroom tools

To use Max Headroom tools, provide a prompt to Max Headroom. The process works as follows:

1.  You provide a prompt to Max Headroom.
2.  The CLI sends the prompt to the core.
3.  The core, along with your prompt and conversation history, sends a list of available tools and their descriptions/schemas to the AI model's API.
4.  The AI model analyzes your request. If it determines that a tool is needed, its response will include a request to execute a specific tool with certain parameters.
5.  The core receives this tool request, validates it, and (often after user confirmation for sensitive operations) executes the tool.
6.  The output from the tool is sent back to the AI model.
7.  The AI model uses the tool's output to formulate its final answer, which is then sent back through the core to the CLI and displayed to you.

You will typically see messages in the CLI indicating when a tool is being called and whether it succeeded or failed.

## Security and confirmation

Many tools, especially those that can modify your file system or execute commands (`write_file`, `edit`, `run_shell_command`), are designed with safety in mind. Max Headroom will typically:

- **Require confirmation:** Prompt you before executing potentially sensitive operations, showing you what action is about to be taken.
- **Utilize sandboxing:** All tools are subject to restrictions enforced by sandboxing (see [Sandbox Documentation](../sandbox.md)). This means that when operating in a sandbox, any tools (including MCP servers) you wish to use must be available _inside_ the sandbox environment. For example, to run an MCP server through `npx` (if npx is used), the `npx` executable must be installed within the sandbox's Docker image or be available in the `sandbox-exec` environment.

It's important to always review confirmation prompts carefully before allowing a tool to proceed.

## Learn more about Max Headroom's tools

Max Headroom's built-in tools can be broadly categorized as follows:

- **[File System Tools](./file-system.md):** For interacting with files and directories (reading, writing, listing, searching, etc.).
- **[Shell Tool](./shell.md) (`run_shell_command`):** For executing shell commands.
- **[Web Fetch Tool](./web-fetch.md) (`web_fetch`):** For retrieving content from URLs. **Note: This tool requires internet access or a locally deployed equivalent resource in a closed network.** It will be disabled by default if no internet access is detected or configurable.
- **[Web Search Tool](./web-search.md) (`google_web_search`):** For searching the web. **Note: This tool requires internet access and is Google-specific. It will be disabled by default in an offline environment. A local search tool alternative would need to be implemented and deployed if web-like search is needed.**
- **[Multi-File Read Tool](./multi-file.md) (`read_many_files`):** A specialized tool for reading content from multiple files or directories, often used by the `@` command.
- **[Memory Tool](./memory.md) (`save_memory`):** For saving and recalling information across sessions using `MAX_HEADROOM.md` files.

Additionally, these tools incorporate:

- **[MCP servers](./mcp-server.md)**: MCP servers act as a bridge between the AI model and your local environment or other services like APIs, which can be hosted internally in a closed network.
- **[Sandboxing](../sandbox.md)**: Sandboxing isolates the model and its changes from your environment to reduce potential risk.
