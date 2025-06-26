# Memory Tool (`save_memory`)

This document describes the `save_memory` tool for Max Headroom.

## Description

Use `save_memory` to save and recall information across your Max Headroom sessions. With `save_memory`, you can direct the CLI to remember key details across sessions, providing personalized and directed assistance.

### Arguments

`save_memory` takes one argument:

- `fact` (string, required): The specific fact or piece of information to remember. This should be a clear, self-contained statement written in natural language.

## How to use `save_memory` with Max Headroom

The tool appends the provided `fact` to a special `MAX_HEADROOM.md` file. The primary location for project-specific memory is `<your_project>/.max_headroom/MAX_HEADROOM.md`. A global memory file can also exist at `~/.max_headroom/MAX_HEADROOM.md`. The name of this file can be configured via the `contextFileName` setting.

Once added, the facts are stored, often under a specific section like `## Max Headroom Added Memories` (or similar, depending on implementation). This file's content is loaded as context in subsequent sessions, allowing the CLI to recall the saved information.

Usage:

```
save_memory(fact="Your fact here.")
```

### `save_memory` examples

Remember a user preference:

```
save_memory(fact="My preferred programming language is Python.")
```

Store a project-specific detail:

```
save_memory(fact="The project I'm currently working on is called 'max-headroom-project'.")
```

## Important notes

- **General usage:** This tool should be used for concise, important facts. It is not intended for storing large amounts of data or conversational history.
- **Memory file:** The memory file is a plain text Markdown file, so you can view and edit it manually if needed.
