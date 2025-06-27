# Web Fetch Tool (`web_fetch`)

This document describes the `web_fetch` tool for Max Headroom.

**Important for Offline Environments:** This tool is designed to fetch content from web URLs. In a closed, offline environment, it will only be functional if the specified URLs point to resources accessible within that restricted network (e.g., internal documentation sites, local web servers). It will not be able to access the public internet. This tool may be disabled by default in an offline-focused build or configuration if no internal web resources are typically accessed this way.

## Description

Use `web_fetch` to summarize, compare, or extract information from accessible web pages. The `web_fetch` tool processes content from one or more URLs (up to 20) embedded in a prompt. `web_fetch` takes a natural language prompt and returns a generated response based on the content of those pages.

### Arguments

`web_fetch` takes one argument:

- `prompt` (string, required): A comprehensive prompt that includes the URL(s) (up to 20) to fetch and specific instructions on how to process their content. For example: `"Summarize http://internal-docs/article and extract key points from http://another-internal-site/data"`. The prompt must contain at least one URL starting with `http://` or `https://`.

## How to use `web_fetch` with Max Headroom

To use `web_fetch` with Max Headroom, provide a natural language prompt that contains URLs accessible from the machine Max Headroom is running on. The tool will ask for confirmation before fetching any URLs.

If Max Headroom is configured to use Google's Gemini API and that API can access the URL, it might process it via its `urlContext`. Otherwise (e.g., when using Ollama or if the Gemini API cannot access the URL), the tool will attempt to fetch content directly from the local machine running Max Headroom. The tool will then format the response for the AI model.

Usage:

```
web_fetch(prompt="Your prompt, including a URL such as https://google.com.")
```

## `web_fetch` examples

Summarize a single article (assuming URL is accessible):

```
web_fetch(prompt="Can you summarize the main points of http://internal-docs/news/latest")
```

Compare two articles (assuming URLs are accessible):

```
web_fetch(prompt="What are the differences in the conclusions of these two documents: http://internal-server/docA and http://internal-server/docB?")
```

## Important notes

- **URL Accessibility:** In an offline environment, ensure all URLs provided are accessible from the machine running Max Headroom. Public internet URLs will not work.
- **Output quality:** The quality of the output will depend on the clarity of the instructions in the prompt and the accessibility/format of the web page content.
- **Fallback Mechanism:** The specifics of how content is fetched (e.g., direct fetch vs. potential API context processing if using a cloud model like Gemini) can vary. For local models like Ollama, it will always be a direct fetch.
