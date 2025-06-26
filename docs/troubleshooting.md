# Troubleshooting Guide for Max Headroom

This guide provides solutions to common issues and debugging tips, focusing on use with local AI models like Ollama in an offline environment.

## Authentication & Local Model Issues

- **Error: `OLLAMA_ENDPOINT not set` or `Cannot connect to Ollama at <URL>`**
  - **Cause:** Max Headroom cannot find or connect to your Ollama instance.
  - **Solution:**
    1.  Ensure Ollama is installed, running, and accessible on your network.
    2.  Verify the `OLLAMA_ENDPOINT` environment variable is correctly set (e.g., `export OLLAMA_ENDPOINT="http://localhost:11434"`). This can be in your shell profile or a `.env` file (e.g., `~/.max_headroom/.env` or `<project>/.max_headroom/.env`).
    3.  If Ollama is on a different machine, ensure the endpoint URL is correct and network connectivity (firewalls, routing) allows Max Headroom to reach it.
    4.  Check Ollama server logs for any startup errors.

- **Error: Ollama model not found (e.g., `Error: model 'your-model-name' not found, try 'ollama pull your-model-name'` from Ollama logs/API response)**
  - **Cause:** The specified Ollama model (either via `OLLAMA_MODEL` env var or in a prompt) is not available in your Ollama instance.
  - **Solution:**
    1.  Ensure you have pulled the model into Ollama: `ollama pull your-model-name`.
    2.  Verify the model name is spelled correctly in your `OLLAMA_MODEL` environment variable or prompt.
    3.  List available models with `ollama list` to confirm.

- **Issue: Slow responses from local models.**
  - **Cause:** Local models, especially large ones, can be resource-intensive (CPU, RAM, GPU VRAM).
  - **Solution:**
    1.  Check your system's resource usage while the model is processing.
    2.  Consider using smaller or quantized versions of models if performance is critical and hardware is limited.
    3.  Ensure Ollama is configured to use available hardware (like a GPU) effectively if applicable.

- **(If Optionally Using Gemini API) Error: `Failed to login. Message: Request contains an invalid argument` or API key issues.**
  - **Cause:** Problems with Google Cloud Project setup or API key for the *optional* Gemini API connection.
  - **Solution:**
    1.  If using Gemini API, ensure `GEMINI_API_KEY` is correct and the associated Google Cloud project has the Gemini API enabled and billing configured.
    2.  For "Login with Google" (OAuth) for Gemini, ensure `GOOGLE_CLOUD_PROJECT` is set if you have a Workspace account or are a licensed Code Assist user.
    3.  Refer to [Google AI Studio](https://aistudio.google.com/app/apikey) for API key management if using that method.
    *This section is secondary for an offline-focused tool.*

## Frequently Asked Questions (FAQs)

- **Q: How do I update Max Headroom to the latest version (in a closed environment)?**
  - **A:** This depends on how it was initially installed.
    - If installed from an internal npm registry: `npm install -g max-headroom-cli@latest` (or your package name).
    - If installed from a tarball: Obtain the new tarball and reinstall: `npm install -g ./max-headroom-cli-vX.Y.Z.tgz`.
    - If running from source: Get the latest source code and rebuild using `npm run build`.

- **Q: Where are Max Headroom configuration files stored?**
  - **A:** The CLI configuration is stored within `settings.json` files: one in your home directory (`~/.max_headroom/settings.json`) and one in your project's root directory (`<project_root>/.max_headroom/settings.json`). Refer to [CLI Configuration](./cli/configuration.md) for more details.

- **Q: Why don't I see cached token counts in my stats output when using Ollama?**
  - **A:** Token caching and detailed token counts are typically features of cloud-based, pay-per-token APIs (like Gemini API). Local models like those served by Ollama usually don't have the same kind of metered token billing, so Max Headroom may not report "cached token savings" for them. The `/stats` command will still show session duration and other relevant local metrics.

## Common Error Messages and Solutions

- **Error: `EADDRINUSE` (Address already in use) when starting an MCP server.**
  - **Cause:** Another process is using the port the MCP server is trying to bind to.
  - **Solution:** Stop the other process or configure the MCP server to use a different port.

- **Error: Command not found (when attempting to run `max-headroom`).**
  - **Cause:** Max Headroom is not correctly installed or not in your system's PATH.
  - **Solution:**
    1.  Ensure Max Headroom installation was successful.
    2.  If installed globally, check that your npm global binary directory is in your PATH.
    3.  If running from source, ensure you are using the correct command to invoke it (e.g., `npm start` or `node bundle/max-headroom.js`).

- **Error: `MODULE_NOT_FOUND` or import errors.**
  - **Cause:** Dependencies are not installed correctly, or the project hasn't been built.
  - **Solution:**
    1.  Run `npm install` or `npm ci` to ensure all dependencies are present.
    2.  Run `npm run build` to compile the project.

- **Error: "Operation not permitted", "Permission denied", or similar when a tool runs.**
  - **Cause:** If sandboxing is enabled, the application is likely attempting an operation restricted by your sandbox (e.g., writing outside allowed project directory).
  - **Solution:** See [Sandboxing](./sandbox.md) for more information, including how to customize your sandbox configuration if necessary and safe for your environment.

## Debugging Tips

- **CLI debugging:**
  - Use the `--debug` or `-d` flag with Max Headroom commands for more detailed output.
  - Check the console output for any error messages from Max Headroom or the underlying AI model via Ollama.

- **Ollama Server Logs:**
  - Check the logs from your Ollama server. These often provide detailed error messages if the model fails to load or if there's an issue with the request. The command is usually `ollama logs` or similar depending on how you run Ollama.

- **Tool issues:**
  - If a specific tool is failing, try to isolate the issue by running the simplest possible version of the command or operation the tool performs.
  - For `run_shell_command`, check that the command works directly in your shell first.
  - For file system tools, double-check paths and permissions.

- **Pre-flight checks (for developers):**
  - Always run `npm run preflight` before committing code. This can catch many common issues related to formatting, linting, and type errors.

If you encounter an issue not covered here, consult any internal documentation for your Max Headroom deployment or contact your local support/development team.
