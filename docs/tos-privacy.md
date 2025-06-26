# Max Headroom: Terms of Service and Privacy Notice Considerations

Max Headroom is an open-source tool that allows you to interact with AI models. Its design prioritizes use with local, offline models (e.g., via Ollama), but it can also be configured to connect with cloud-based AI services. The terms and privacy considerations vary significantly based on how you use it.

**Key Principle for Offline Use:** When Max Headroom is used with local models like Ollama, your prompts, the code it analyzes, and the responses generated **stay on your local machine** and are not transmitted to any external servers by Max Headroom itself.

## 1. Using Max Headroom with Local Offline Models (e.g., Ollama)

This is the primary intended use case for Max Headroom in a restricted environment.

-   **Terms of Service:**
    -   Your use of the Max Headroom software is governed by its open-source license (e.g., Apache 2.0, assuming it's inherited from Gemini CLI).
    -   Your use of the local AI model provider (e.g., Ollama) and any models you download for it are subject to their respective licenses and terms.
-   **Privacy & Data Handling:**
    -   **No Data Transmission by Max Headroom:** Max Headroom, when configured for local models, does not send your prompts, code snippets, or AI-generated responses to any external servers. All interaction with the AI model occurs locally.
    -   **Local Storage:**
        -   Configuration files (e.g., `settings.json`) are stored in `~/.max_headroom/` (user) and `<project_root>/.max_headroom/` (project).
        -   Context files (`MAX_HEADROOM.md`) are stored where you create them.
        -   Command history is stored locally.
        -   Any files read or written by tools operate on your local file system under your user permissions.
    -   **Your Responsibility:** You are responsible for the security of your local machine and the data you process with Max Headroom. Ensure that access to your machine and these local files is controlled according to your environment's policies.

## 2. Using Max Headroom with Cloud-Based AI Services (Optional, e.g., Google Gemini API)

If you choose to configure Max Headroom to connect to an external, cloud-based AI service (like Google's Gemini API, or others), the following applies:

-   **Terms of Service:** Your use of that specific cloud AI service is governed by **that provider's Terms of Service.** For example, if using the Gemini API, the [Google AI Generative Language Models API Terms of Service](https://ai.google.dev/terms) would apply.
-   **Privacy & Data Handling:**
    -   **Data Transmission:** When using a cloud service, your prompts, any context sent (e.g., content of files provided via `@` command), and other interactions will be transmitted to that cloud provider.
    -   **Provider's Policies Apply:** The cloud provider's privacy policy and data usage terms will dictate how your data is collected, used, stored, and protected. This may include usage for service improvement, model training (unless specified otherwise by enterprise terms), and human review.
    -   **Confidential Information:** **Exercise extreme caution.** Do not send confidential or sensitive information to any third-party cloud service unless you fully understand and accept their data handling practices and have the necessary authorizations.
    -   For Google services, refer to the relevant Google privacy policies, the Gemini Apps Privacy Hub, and specific terms for Workspace or Cloud accounts if applicable.

## Usage Statistics and Telemetry (for Max Headroom)

For Max Headroom deployed in a closed, offline environment:

-   **Disabled by Default:** All telemetry and external usage statistics reporting features that might have been inherited from Gemini CLI should be **disabled by default** in the application's configuration for such deployments.
-   **Configuration:**
    -   Ensure `telemetry.enabled` is `false` in `settings.json`.
    -   Ensure `usageStatisticsEnabled` is `false` in `settings.json`.
-   **No External Data Collection:** The goal is that Max Headroom itself does not initiate any network connections to external servers for telemetry or usage statistics in its offline-first configuration.
-   **Local Diagnostics Only:** If any telemetry-like code is retained for local debugging purposes (e.g., outputting to a local file or a local OTLP collector), it must be explicitly enabled for that specific debugging session and must not transmit data externally.
-   Refer to the [Telemetry documentation](./telemetry.md) for more details on how telemetry *would* function if it were enabled (primarily for understanding local debugging capabilities).

## Frequently Asked Questions (FAQ) for Max Headroom

-   **Q: When using Max Headroom with Ollama, is my data sent to Google or any other cloud?**
    -   **A:** No. When configured solely with Ollama or other local models, Max Headroom processes your data locally. There is no transmission to Google or other external cloud services by Max Headroom.

-   **Q: If I optionally configure Max Headroom to use the Gemini API, what happens to my data?**
    -   **A:** Your prompts and any provided context will be sent to Google, and Google's terms and privacy policies for the Gemini API will apply. Review those carefully.

-   **Q: How can I be sure Max Headroom isn't sending data externally in my closed environment?**
    -   **A:**
        1.  Ensure you are using an authentication method for a local model provider (e.g., Ollama).
        2.  Verify that telemetry settings (`telemetry.enabled` and `usageStatisticsEnabled`) are `false` in your `settings.json` files.
        3.  Monitor network traffic from the machine running Max Headroom if further assurance is needed.
        4.  For builds specifically for the closed environment, any code responsible for external telemetry calls could be reviewed for removal or stubbing.

Always prioritize understanding the data flow and terms of any component you use, especially when handling sensitive information. For Max Headroom in a closed environment with local models, the design intent is to keep your data local.
