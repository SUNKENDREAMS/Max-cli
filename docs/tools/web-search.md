# Web Search Tool (`google_web_search`) - Primarily for Online Google Model Use

This document describes the `google_web_search` tool, which is designed to work with Google's Gemini API.

**Important for Offline Environments (e.g., with Ollama):** This tool is **heavily dependent on internet access and Google's services (Gemini API and Google Search).** In a closed, offline environment, or when Max Headroom is configured to use a local model like Ollama, this tool **will not be functional.**

For Max Headroom deployments in restricted environments:
- This tool should be **disabled by default**.
- If search functionality is required for internal documents, a dedicated local search index (e.g., Solr, Elasticsearch, or a simpler file-based search) and a new custom tool would need to be developed and integrated into Max Headroom.

## Description (Original Intended Functionality)

Use `google_web_search` to perform a web search using Google Search via the Gemini API. The `google_web_search` tool returns a summary of web results with sources.

### Arguments

`google_web_search` takes one argument:

- `query` (string, required): The search query.

## How to use `google_web_search` with Max Headroom (when using Gemini API online)

When Max Headroom is configured with the Gemini API and has internet access, the `google_web_search` tool sends a query to the Gemini API, which then performs a web search. `google_web_search` will return a generated response based on the search results, including citations and sources.

Usage:

```
google_web_search(query="Your query goes here.")
```

## `google_web_search` examples

Get information on a topic:

```
google_web_search(query="latest advancements in AI-powered code generation")
```

## Important notes

- **Response returned:** The `google_web_search` tool returns a processed summary, not a raw list of search results.
- **Citations:** The response includes citations to the sources used to generate the summary.
