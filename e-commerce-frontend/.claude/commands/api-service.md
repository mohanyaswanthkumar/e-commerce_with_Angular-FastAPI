---
description: Creates an Angular service configured to communicate with the FastAPI backend endpoints
argument-hint: [service-name endpoint-path]
---

Create an Angular service for handling API communication with the FastAPI backend based on: $ARGUMENTS.
Requirements:
- Use Angular's modern `inject(HttpClient)` pattern.
- Define TypeScript interfaces/types matching the expected FastAPI request/response DTOs.
- Handle error logging and standard observable returns correctly.
- Place the service in the appropriate `src/app/core/services/` or feature services folder.