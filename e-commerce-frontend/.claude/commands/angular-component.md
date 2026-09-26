---
description: Generates a new standalone Angular component (.ts, .html, .css) with proper imports
argument-hint: [component-name path/to/folder]
---

Create a new standalone Angular component based on the request: $ARGUMENTS.
Requirements:
- Create it as a **standalone component** (`standalone: true`).
- Generate the `.ts`, `.html`, and `.css` files in the specified path.
- Follow modern Angular conventions (signals if applicable, clean typing).
- Include standard lifecycle hooks or inputs/outputs if mentioned in the prompt.