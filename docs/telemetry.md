# Max Headroom Observability Guide

Telemetry can provide data about Max Headroom's performance, health, and usage. If enabled, it can help monitor operations and debug issues through traces, metrics, and structured logs. However, **for closed, offline environments, telemetry should be disabled by default and any external reporting carefully considered or removed.**

Max Headroom's telemetry system (if retained and enabled) is built on the **[OpenTelemetry] (OTEL)** standard, allowing data to be sent to any compatible backend, typically a local one in an offline scenario.

[OpenTelemetry]: https://opentelemetry.io/

## Enabling Telemetry (Primarily for Local Debugging)

Telemetry should be **disabled by default** for production builds in a closed environment. If enabled for local debugging purposes, configuration is primarily managed via the [`.max_headroom/settings.json` file](./cli/configuration.md) and environment variables. CLI flags can override these settings for a specific session.

### Order of Precedence (If Telemetry Code is Active)

The following lists the precedence for applying telemetry settings, with items listed higher having greater precedence:

1.  **CLI flags (for `max-headroom` command):**

    - `--telemetry` / `--no-telemetry`: Overrides `telemetry.enabled`. **`--no-telemetry` or ensuring `telemetry.enabled: false` is recommended for offline use.**
    - `--telemetry-target <local>`: Overrides `telemetry.target`. Only `local` is relevant for offline use.
    - `--telemetry-otlp-endpoint <URL>`: Overrides `telemetry.otlpEndpoint`.
    - `--telemetry-log-prompts` / `--no-telemetry-log-prompts`: Overrides `telemetry.logPrompts`. **Should be `false` for offline/sensitive use.**

1.  **Environment variables:**

    - `OTEL_EXPORTER_OTLP_ENDPOINT`: Overrides `telemetry.otlpEndpoint`.

1.  **Workspace settings file (`.max_headroom/settings.json`):** Values from the `telemetry` object in this project-specific file.

1.  **User settings file (`~/.max_headroom/settings.json`):** Values from the `telemetry` object in this global user file.

1.  **Defaults (should be set for offline safety):**
    - `telemetry.enabled`: `false` (Strongly Recommended Default)
    - `telemetry.target`: `local`
    - `telemetry.otlpEndpoint`: `http://localhost:4317` (or similar standard local port)
    - `telemetry.logPrompts`: `false` (Strongly Recommended Default)

**Note on `npm run telemetry` script:**
If this script is retained, its `--target` argument would typically only override `telemetry.target` for the script's duration (e.g., for starting a local collector). It should not permanently change settings to enable telemetry for an external target in an offline build.

### Example Settings for Offline (Telemetry Disabled)

Ensure your workspace (`.max_headroom/settings.json`) or user (`~/.max_headroom/settings.json`) settings explicitly disable telemetry:

```json
{
  "telemetry": {
    "enabled": false,
    "target": "local", // Irrelevant if enabled is false
    "logPrompts": false
  },
  "usageStatisticsEnabled": false // Ensure this is also false
}
```

## Running an OTEL Collector (Locally, if needed for debugging)

An OTEL Collector is a service that receives, processes, and exports telemetry data. If telemetry is enabled for local debugging, the CLI would send data using the OTLP/gRPC protocol to a local collector.

Learn more about OTEL exporter standard configuration in [documentation][otel-config-docs].

[otel-config-docs]: https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/

### Local Collector Setup (Example using `npm run telemetry`)

If the `npm run telemetry -- --target=local` script is maintained, it could automate setting up a local telemetry pipeline (e.g., with Jaeger for traces).

1.  **Run the command (if available and telemetry is temporarily enabled for debugging):**
    ```bash
    # This assumes telemetry is enabled in settings or via CLI flag for this session only
    npm run telemetry -- --target=local
    ```
    The script might:
    - Download Jaeger and OTEL if needed.
    - Start a local Jaeger instance (e.g., on **http://localhost:16686**).
    - Start an OTEL collector configured to receive data from Max Headroom.
    - On exit, it should ideally restore settings to disable telemetry.

2.  **Inspect logs and metrics locally:**
    The script might redirect collector output to a local file, e.g., `~/.max_headroom/tmp/<projectHash>/otel/collector.log`.

3.  **Stop the local services**:
    Press `Ctrl+C` in the terminal where the script is running.

**Cloud-based telemetry (e.g., Google Cloud) should be removed or entirely disabled for offline builds.** The sections related to GCP telemetry in the original document are omitted here as they are not suitable for a closed environment.

## Logs and Metric Reference (If Telemetry is Locally Enabled for Debugging)

The following describes the potential structure of logs and metrics.
- A `sessionId` is included as a common attribute.

### Logs

- `max_headroom.config`: CLI configuration at startup.
  - Attributes: `model`, `embedding_model` (if applicable), `sandbox_enabled`, `core_tools_enabled`, `approval_mode`, `auth_method_selected`, `log_prompts_enabled`, etc.
- `max_headroom.user_prompt`: User prompt submission.
  - Attributes: `prompt_length`. `prompt` text itself should NOT be logged if `log_prompts_enabled` is `false`.
- `max_headroom.tool_call`: Tool function call.
  - Attributes: `function_name`, `duration_ms`, `success`, `decision`, `error`, `error_type`. `function_args` should be excluded or heavily sanitized if sensitive.
- `max_headroom.api_request`: Request to an AI model API (e.g., local Ollama).
  - Attributes: `model`, `request_text` (if `log_prompts_enabled` and applicable).
- `max_headroom.api_error`: AI model API request failure.
  - Attributes: `model`, `error`, `error_type`, `status_code`, `duration_ms`.
- `max_headroom.api_response`: Response from AI model API.
  - Attributes: `model`, `status_code`, `duration_ms`, `input_token_count`, `output_token_count` (if applicable). `response_text` should be excluded if sensitive.

### Metrics

- `max_headroom.session.count` (Counter, Int): CLI startup.
- `max_headroom.tool.call.count` (Counter, Int): Tool calls.
  - Attributes: `function_name`, `success`, `decision`.
- `max_headroom.tool.call.latency` (Histogram, ms): Tool call latency.
  - Attributes: `function_name`, `decision`.
- `max_headroom.api.request.count` (Counter, Int): AI API requests.
  - Attributes: `model`, `status_code`, `error_type`.
- `max_headroom.api.request.latency` (Histogram, ms): AI API request latency.
  - Attributes: `model`.
- `max_headroom.token.usage` (Counter, Int): Token usage (if applicable for the model).
  - Attributes: `model`, `type`.
- `max_headroom.file.operation.count` (Counter, Int): File operations.
  - Attributes: `operation`, `lines`, `mimetype`, `extension`.

**For a closed environment, ensure all telemetry is off by default. Only enable local telemetry for specific debugging sessions if absolutely necessary and ensure no data is transmitted externally.**
