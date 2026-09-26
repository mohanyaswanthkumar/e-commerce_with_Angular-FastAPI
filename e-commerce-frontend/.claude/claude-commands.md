# Claude Code Commands — Master Reference

> **Purpose:** Personal quick-reference for Claude Code built-in commands, CLI commands, keyboard shortcuts, custom Skills/commands, agents, hooks, MCP, plugins, and common development workflows.
>
> **Important:** Claude Code changes frequently. Some commands are version-, platform-, plan-, provider-, or environment-dependent. Use `/help`, `/skills`, `claude --help`, and the official documentation when something differs from this file.
>
> **Official references**
> - Commands: https://code.claude.com/docs/en/commands
> - CLI reference: https://code.claude.com/docs/en/cli-reference
> - Interactive mode: https://code.claude.com/docs/en/interactive-mode
> - Skills: https://code.claude.com/docs/en/skills

---

# 1. Quick Reference

| Command | Purpose |
|---|---|
| `/help` | Show help and available commands |
| `/init` | Create/init a `CLAUDE.md` project guide |
| `/memory` | Manage `CLAUDE.md` and auto memory |
| `/clear` | Start a fresh conversation |
| `/compact` | Summarize conversation to free context |
| `/context` | Inspect context-window usage |
| `/resume` | Resume an earlier session |
| `/rename` | Rename current session |
| `/branch` | Branch current conversation |
| `/fork` | Copy conversation into a background session |
| `/subtask` | Give a task to a background subagent |
| `/tasks` | View/manage background work |
| `/agents` | Manage/inspect subagents |
| `/model` | Change model |
| `/effort` | Change reasoning effort |
| `/fast` | Toggle fast mode |
| `/plan` | Enter plan mode |
| `/permissions` | Manage tool permissions |
| `/config` | Configure Claude Code |
| `/status` | Show session/account/status |
| `/diff` | Review current working-tree changes |
| `/code-review` | Review code/diff/PR |
| `/review` | Alias for `/code-review` |
| `/security-review` | Security review of branch changes |
| `/simplify` | Simplify/clean up changed code |
| `/verify` | Verify changes/application |
| `/run` | Run/drive the application |
| `/doctor` | Diagnose Claude Code setup |
| `/debug` | Debug Claude Code/session problems |
| `/mcp` | Manage MCP servers |
| `/plugin` | Manage plugins |
| `/skills` | List available Skills |
| `/reload-skills` | Reload Skills/commands from disk |
| `/reload-plugins` | Reload active plugins |
| `/hooks` | Inspect hooks |
| `/background` | Detach current session into background |
| `/batch` | Parallelize a large codebase change |
| `/loop` | Repeat a prompt on an interval |
| `/schedule` | Manage cloud routines |
| `/remote-control` | Control session remotely |
| `/teleport` | Pull a cloud session into terminal |
| `/desktop` | Move session to Claude Code Desktop |
| `/export` | Export conversation |
| `/copy` | Copy assistant response |
| `/rewind` | Rewind conversation/code |
| `/btw` | Ask a side question without changing main conversation |
| `/release-notes` | View Claude Code release notes |
| `/usage` | View usage/cost/activity |
| `/cost` | Alias for `/usage` |
| `/stats` | Alias for `/usage` |
| `/exit` | Exit Claude Code |
| `/quit` | Alias for `/exit` |

---

# 2. How Claude Code Commands Work

Most Claude Code commands begin with `/`.

```text
/command [arguments]
```

Examples:

```text
/help
/model
/model sonnet
/plan fix authentication
/code-review high
/code-review high --fix
/compact focus on the authentication changes
```

Commands are recognized at the **start of the message**. Type `/` to open/filter the command menu.

For Skills, multiple Skills can be chained at the beginning of a prompt:

```text
/skill-a /skill-b perform this task
```

Current Claude Code supports chaining up to six Skills.

---

# 3. Built-in Slash Commands

## 3.1 Project / Directory

### `/add-dir <path>`

Add another directory for file access in the current session.

```text
/add-dir ../shared
/add-dir C:\Projects\common
```

Use when Claude needs to read/edit another directory.

---

### `/cd <path>`

Move the current Claude Code session to another working directory while keeping the conversation.

```text
/cd ../backend
/cd C:\Projects\ecommerce
```

**Difference:**

- `/cd` changes the session working directory.
- `/add-dir` adds another directory Claude can access.

---

### `/init`

Initialize a project with a `CLAUDE.md` guide.

```text
/init
```

Useful first command in a new repository.

---

### `/memory`

Manage project/user memory and `CLAUDE.md` files.

```text
/memory
```

Use it to inspect/refine persistent instructions and auto-memory behavior.

---

## 3.2 Conversation / Context

### `/clear`

Start a new conversation with empty context.

Aliases:

```text
/reset
/new
```

```text
/clear
/clear authentication-refactor
```

Use `/compact` instead if you want to keep the same conversation but reduce context usage.

---

### `/compact [instructions]`

Summarize the current conversation to free context.

```text
/compact
```

Focused compaction:

```text
/compact keep the API design, database schema, and unresolved errors
```

---

### `/context [all]`

Show context-window usage.

```text
/context
/context all
```

Useful when Claude starts losing earlier context.

---

### `/resume [session]`

Resume a previous session.

```text
/resume
/resume auth-refactor
```

Alias:

```text
/continue
```

---

### `/rename [name]`

Rename the current session.

```text
/rename payment-preference-api
```

Without an argument, Claude can generate a name.

---

### `/branch [name]`

Create a branch of the current conversation and switch to it.

```text
/branch try-new-architecture
```

Use when you want to explore a different implementation without losing the current conversation.

---

### `/fork [prompt]`

Copy the current conversation into a background session.

```text
/fork investigate the Redis issue
```

The original conversation continues independently.

---

### `/subtask <task>`

Send a side task to a background subagent.

```text
/subtask inspect all payment-related classes and identify missing tests
```

Useful for parallel investigation.

---

### `/btw [question]`

Ask a side question without adding it to the main conversation.

```text
/btw why are we using Redis here?
```

Good for understanding code without disturbing the main task.

---

### `/rewind`

Rewind conversation and/or code to an earlier checkpoint.

Aliases:

```text
/checkpoint
/undo
```

```text
/rewind
```

Use carefully: inspect the rewind options before restoring code.

---

### `/export [filename]`

Export the current conversation.

```text
/export
/export session-notes.txt
```

---

### `/copy [N]`

Copy the latest assistant response to the clipboard.

```text
/copy
/copy 2
```

`/copy 2` means the second-to-last response.

---

### `/recap`

Generate a short summary of the current session.

```text
/recap
```

---

## 3.3 Models / Reasoning

### `/model [model]`

Switch the current model.

```text
/model
/model sonnet
/model opus
/model haiku
```

Without an argument, opens the model picker.

---

### `/effort [level|auto|status]`

Change reasoning effort.

Typical levels:

```text
/effort low
/effort medium
/effort high
/effort xhigh
/effort max
/effort auto
/effort status
```

Availability depends on the selected model and Claude Code version.

---

### `/fast [on|off]`

Toggle fast mode.

```text
/fast
/fast on
/fast off
```

---

### `/autocompact [auto|tokens]`

Configure the context size at which automatic compaction happens.

```text
/autocompact
/autocompact auto
/autocompact 500k
```

---

### `/advisor [model|off]`

Configure the advisor tool where available.

```text
/advisor
/advisor opus
/advisor sonnet
/advisor off
```

Availability is version/plan/environment dependent.

---

## 3.4 Planning / Coding

### `/plan [description]`

Enter plan mode.

```text
/plan
```

Or:

```text
/plan migrate authentication from session auth to JWT
```

Recommended for large or risky changes.

---

### `/diff`

Review current working-tree changes.

```text
/diff
```

Use before committing.

---

### `/code-review [level] [options]`

Review code/diff/PR.

Examples:

```text
/code-review
/code-review high
/code-review high --fix
/code-review medium --comment
/code-review high 1234
/code-review ultra
```

Possible effort levels include:

```text
low
medium
high
xhigh
max
ultra
```

Useful options:

```text
--fix
--comment
--post
```

---

### `/review`

Alias for `/code-review`.

```text
/review
/review high
/review high --fix
```

---

### `/security-review`

Analyze current branch changes for security vulnerabilities.

```text
/security-review
```

Useful for checking:

- authentication
- authorization
- injection
- sensitive-data exposure
- insecure API behavior
- security configuration

---

### `/simplify [target]`

Review changed code for cleanup/simplification.

```text
/simplify
/simplify src/main/java/com/example/payment
```

This is for cleanup/abstraction/efficiency rather than correctness bugs.

Use `/code-review` for correctness review.

---

### `/verify`

Run verification of changes where the bundled verification Skill is available.

```text
/verify
```

---

### `/run`

Run/drive the project application to verify behavior.

```text
/run
```

Useful when passing tests alone is not enough.

---

### `/run-skill-generator`

Generate project-specific instructions that teach `/run` and `/verify` how to build, launch, and drive the application.

```text
/run-skill-generator
```

---

### `/batch <instruction>`

Parallelize a large codebase change into independent work units.

```text
/batch migrate the backend from Java 17 to Java 21
```

Best for large, separable migrations.

---

## 3.5 Background Work / Agents

### `/agents`

Inspect/manage subagents.

```text
/agents
```

Current versions may direct you to create/manage subagents through `.claude/agents/` or by asking Claude to manage them.

---

### `/list-agents`

List available subagents, teammates, and sessions when cross-session messaging is enabled.

```text
/list-agents
```

Alias:

```text
/peers
```

---

### `/tasks`

View/manage background work.

```text
/tasks
```

Alias:

```text
/bashes
```

---

### `/background [prompt]`

Detach the current session into a background agent.

```text
/background
/background continue investigating the failing integration tests
```

Alias:

```text
/bg
```

---

### `/stop`

Stop the current background session while attached to it.

```text
/stop
```

The transcript/worktree are retained.

---

## 3.6 Skills / Custom Commands

### `/skills`

List available Skills.

```text
/skills
```

Skills may come from:

- built-in/bundled Skills
- project Skills
- personal Skills
- plugins
- claude.ai synced Skills
- MCP prompts

---

### `/reload-skills`

Reload Skills and command directories from disk without restarting.

```text
/reload-skills
```

Useful after creating/editing:

```text
.claude/skills/
.claude/commands/
~/.claude/skills/
```

---

### `/skill-doctor`

Inspect Skill context cost and usage.

```text
/skill-doctor
```

Useful for finding Skills that consume significant context.

---

## 3.7 MCP

### `/mcp`

Manage MCP servers.

```text
/mcp
```

Reconnect:

```text
/mcp reconnect github
```

Enable:

```text
/mcp enable github
```

Disable:

```text
/mcp disable github
```

Disable all:

```text
/mcp disable all
```

---

## 3.8 Plugins

### `/plugin`

Manage Claude Code plugins.

```text
/plugin
/plugin list
/plugin install <plugin>
/plugin enable <plugin>
/plugin disable <plugin>
```

---

### `/reload-plugins [--force]`

Reload active plugins.

```text
/reload-plugins
/reload-plugins --force
```

Use after changing plugin files/configuration.

---

## 3.9 Hooks

### `/hooks`

View configured hooks.

```text
/hooks
```

Hooks can run automatically around Claude Code events such as:

- tool execution
- session start/end
- compaction
- notifications
- worktree operations
- directory changes

---

## 3.10 Permissions / Configuration

### `/permissions`

Manage permission rules.

```text
/permissions
```

Typical permission categories:

```text
allow
ask
deny
```

Useful for controlling tools such as:

```text
Bash
Read
Edit
Write
WebFetch
MCP tools
```

Alias:

```text
/allowed-tools
```

---

### `/config [key=value ...]`

Open/configure settings.

```text
/config
/config theme=dark
/config model=sonnet
/config thinking=false
```

Alias:

```text
/settings
```

---

### `/update-config [request]`

Ask Claude to modify the appropriate `settings.json`.

```text
/update-config allow git status
/update-config add a hook that runs tests after editing Java files
```

---

### `/status`

Show current:

- Claude Code version
- model
- account
- connectivity
- session information

```text
/status
```

---

### `/statusline`

Configure the terminal status line.

```text
/statusline
```

---

### `/theme`

Change terminal theme.

```text
/theme
```

---

### `/color [color|default]`

Change prompt bar color.

```text
/color
/color blue
/color green
/color default
```

---

### `/output-style [style]`

List or select output style.

```text
/output-style
/output-style concise
```

---

### `/tui [default|fullscreen]`

Choose the terminal UI renderer.

```text
/tui
/tui fullscreen
/tui default
```

---

### `/keybindings`

Open keyboard shortcut configuration.

```text
/keybindings
```

---

### `/terminal-setup`

Configure terminal multiline/keyboard behavior.

```text
/terminal-setup
```

---

## 3.11 Debugging / Diagnostics

### `/doctor`

Diagnose Claude Code installation/configuration.

```text
/doctor
```

Alias:

```text
/checkup
```

CLI equivalent:

```bash
claude doctor
```

---

### `/debug [description]`

Enable/debug Claude Code session logging and investigate an issue.

```text
/debug
/debug MCP server is not connecting
```

---

### `/heapdump`

Create a JavaScript heap snapshot for memory diagnostics.

```text
/heapdump
```

**Security:** the `.heapsnapshot` can contain conversation/credential data. Do not share it casually.

---

### `/feedback [report]`

Send product feedback.

```text
/feedback
/feedback MCP connection repeatedly fails
```

---

### `/bug [report]`

Report a Claude Code bug.

```text
/bug
/bug Claude crashes when loading this plugin
```

Alias:

```text
/share
```

---

## 3.12 GitHub / GitLab

### `/install-github-app`

Install/configure the Claude GitHub App.

```text
/install-github-app
```

---

### `/install-slack-app`

Install/configure Claude Slack integration.

```text
/install-slack-app
```

---

### `/pr-comments`

**Removed in modern versions.**

Older versions used:

```text
/pr-comments
```

Modern approach: ask Claude directly to inspect PR comments or use the current PR review workflow.

---

## 3.13 Remote / Cloud / Desktop

### `/remote-control`

Make the current session controllable from claude.ai.

```text
/remote-control
```

Alias:

```text
/rc
```

---

### `/remote-env`

Select the default cloud environment.

```text
/remote-env
```

---

### `/teleport`

Pull a cloud session into the current terminal.

```text
/teleport
```

Alias:

```text
/tp
```

---

### `/desktop`

Continue the current session in Claude Code Desktop.

```text
/desktop
```

Alias:

```text
/app
```

---

### `/mobile`

Show the QR code for Claude mobile.

```text
/mobile
```

Aliases:

```text
/ios
/android
```

---

## 3.14 Scheduling / Automation

### `/loop [interval] [prompt]`

Run a prompt repeatedly while the session remains open.

```text
/loop 5m check if the deployment finished
```

Self-paced:

```text
/loop check the CI status
```

Alias:

```text
/proactive
```

---

### `/schedule [description]`

Create/manage cloud routines.

```text
/schedule
/schedule every weekday at 9 AM check the build status
```

Alias:

```text
/routines
```

---

## 3.15 Usage / Account

### `/usage`

Show usage, cost, limits, and activity.

```text
/usage
```

Aliases:

```text
/cost
/stats
```

---

### `/rate-limit-options`

Show options after hitting usage limits.

```text
/rate-limit-options
```

This command may be hidden from the menu; type it directly.

---

### `/usage-credits`

Manage usage credits where available.

```text
/usage-credits
```

---

### `/upgrade`

Open plan upgrade flow.

```text
/upgrade
```

---

### `/passes`

Referral/pass feature where the account is eligible.

```text
/passes
```

---

### `/privacy-settings`

View/update privacy settings where available.

```text
/privacy-settings
```

---

## 3.16 Authentication

### `/login`

Sign in.

```text
/login
```

---

### `/logout`

Sign out.

```text
/logout
```

---

## 3.17 Miscellaneous Built-in Commands

### `/release-notes`

Open Claude Code release notes.

```text
/release-notes
```

---

### `/powerup`

Interactive feature-learning experience.

```text
/powerup
```

---

### `/artifacts`

Manage available Artifacts where supported.

```text
/artifacts
```

---

### `/chrome`

Configure Claude in Chrome integration.

```text
/chrome
```

---

### `/dataviz [request]`

Design charts/graphs/dashboards.

```text
/dataviz create a sales dashboard from sales.csv
```

---

### `/design [brief]`

Create UI/design mockups where supported.

```text
/design create a checkout page for an ecommerce application
```

---

### `/design-login`

Authorize design-system access for design synchronization.

```text
/design-login
```

---

### `/design-sync [hint]`

Sync a React design system where supported.

```text
/design-sync
/design-sync Ecommerce Design System
```

---

### `/claude-api [subcommand]`

Claude API/Managed Agents development Skill.

Examples:

```text
/claude-api
/claude-api migrate
/claude-api upgrade
/claude-api managed-agents-onboard
/claude-api prompt-audit
/claude-api cost-optimize
/claude-api build-eval
/claude-api hillclimb
```

---

### `/fewer-permission-prompts`

Analyze transcripts for commonly approved read-only operations and propose permission allow rules.

```text
/fewer-permission-prompts
```

---

### `/team-onboarding`

Generate an onboarding guide from recent Claude Code usage.

```text
/team-onboarding
```

---

### `/auto-mode-setup`

Draft Auto Mode environment configuration where supported.

```text
/auto-mode-setup
```

---

### `/autofix-pr [prompt]`

Create a cloud session that watches the current PR and fixes CI/review issues.

```text
/autofix-pr
/autofix-pr only fix lint and type errors
```

Requires GitHub CLI/cloud-session support.

---

### `/setup-bedrock`

Configure Amazon Bedrock.

```text
/setup-bedrock
```

This is hidden unless:

```text
CLAUDE_CODE_USE_BEDROCK=1
```

---

### `/setup-vertex`

Configure Google Cloud Agent Platform/Vertex configuration.

```text
/setup-vertex
```

This is hidden unless:

```text
CLAUDE_CODE_USE_VERTEX=1
```

---

### `/sandbox`

Toggle sandbox mode where supported.

```text
/sandbox
```

---

### `/scroll-speed`

Configure mouse-wheel scroll speed in supported fullscreen UI.

```text
/scroll-speed
```

---

### `/stickers`

Claude Code sticker ordering feature.

```text
/stickers
```

---

### `/radio`

Open Claude FM/lo-fi radio.

```text
/radio
```

---

### `/advisor`

See the model/advisor section above.

---

# 4. Removed / Deprecated Commands

These are useful to know so you don't waste time trying old commands.

| Old command | Current situation |
|---|---|
| `/ultraplan` | Removed; use `/plan` |
| `/pr-comments` | Removed in modern versions; ask Claude directly |
| `/extra-usage` | Older name; current command is `/usage-credits` |
| `/enable-auto-mode` CLI flag | Removed; use `--permission-mode auto` |
| `/review` | Still available, but now an alias of `/code-review` |
| `/reset` | Alias of `/clear` |
| `/new` | Alias of `/clear` |
| `/continue` | Alias of `/resume` |
| `/undo` | Alias of `/rewind` |
| `/checkpoint` | Alias of `/rewind` |
| `/allowed-tools` | Alias of `/permissions` |
| `/settings` | Alias of `/config` |
| `/cost` | Alias of `/usage` |
| `/stats` | Alias of `/usage` |
| `/quit` | Alias of `/exit` |
| `/bg` | Alias of `/background` |
| `/rc` | Alias of `/remote-control` |
| `/app` | Alias of `/desktop` |
| `/tp` | Alias of `/teleport` |
| `/routines` | Alias of `/schedule` |
| `/proactive` | Alias of `/loop` |
| `/bashes` | Alias of `/tasks` |
| `/peers` | Alias of `/list-agents` |
| `/ios` | Alias of `/mobile` |
| `/android` | Alias of `/mobile` |

---

# 5. Claude Code CLI

## 5.1 Start Claude

```bash
claude
```

Start with an initial prompt:

```bash
claude "Explain this project"
```

---

## 5.2 Print / Non-interactive mode

```bash
claude -p "Explain this function"
```

Alias:

```bash
claude --print "Explain this function"
```

Useful for scripting/automation.

---

## 5.3 Pipe content into Claude

Linux/macOS/WSL:

```bash
cat logs.txt | claude -p "Explain these errors"
```

Windows PowerShell:

```powershell
Get-Content logs.txt | claude -p "Explain these errors"
```

---

## 5.4 Continue latest session

```bash
claude -c
```

Equivalent:

```bash
claude --continue
```

---

## 5.5 Continue with another prompt

```bash
claude -c -p "Now fix the failing test"
```

---

## 5.6 Resume a named/ID session

```bash
claude -r "auth-refactor"
```

Equivalent:

```bash
claude --resume "auth-refactor"
```

With a new prompt:

```bash
claude -r "auth-refactor" "Finish the implementation"
```

---

## 5.7 Start a named session

```bash
claude -n "payment-preference-work"
```

---

## 5.8 Check version

```bash
claude --version
claude -v
```

---

## 5.9 Update Claude Code

```bash
claude update
```

---

## 5.10 Authentication

```bash
claude auth login
claude auth logout
claude auth status
```

Human-readable status:

```bash
claude auth status --text
```

Console authentication:

```bash
claude auth login --console
```

SSO:

```bash
claude auth login --sso
```

---

## 5.11 Diagnostics

```bash
claude doctor
```

---

## 5.12 Agent management

```bash
claude agents
```

JSON:

```bash
claude agents --json
```

Attach:

```bash
claude attach <session-id>
```

Stop:

```bash
claude stop <session-id>
```

Alias:

```bash
claude kill <session-id>
```

---

## 5.13 Worktree

Start isolated worktree:

```bash
claude --worktree feature-auth
```

Short form:

```bash
claude -w feature-auth
```

---

# 6. Important CLI Flags

## Directory / project

```bash
--add-dir <path>
--worktree <name>
--setting-sources <sources>
--settings <file-or-json>
```

Example:

```bash
claude --add-dir ../shared ../common
```

---

## Model

```bash
--model <model>
--fallback-model <model1,model2>
--effort <level>
--advisor <model>
```

Examples:

```bash
claude --model sonnet
claude --model opus --effort high
claude --fallback-model sonnet,haiku
```

---

## Permission modes

```bash
--permission-mode default
--permission-mode acceptEdits
--permission-mode plan
--permission-mode auto
--permission-mode dontAsk
--permission-mode bypassPermissions
```

Example:

```bash
claude --permission-mode plan
```

### Dangerous

```bash
claude --dangerously-skip-permissions
```

Equivalent to bypass-permissions mode.

**Use only in an appropriately isolated/sandboxed environment.**

---

## Allowed tools

```bash
--allowedTools
--allowed-tools
```

Example:

```bash
claude --allowedTools "Read" "Bash(git status *)" "Bash(git diff *)"
```

---

## Disallowed tools

```bash
--disallowedTools
--disallowed-tools
```

Example:

```bash
claude --disallowedTools "Bash(rm *)"
```

---

## Restrict tools

```bash
--tools
```

Example:

```bash
claude --tools "Bash,Read,Edit"
```

Disable all built-in tools:

```bash
claude --tools ""
```

---

## System prompt

Replace default system prompt:

```bash
claude --system-prompt "You are a Java expert"
```

From file:

```bash
claude --system-prompt-file ./prompt.txt
```

Append rules:

```bash
claude --append-system-prompt "Always use Java records for response DTOs"
```

From file:

```bash
claude --append-system-prompt-file ./rules.txt
```

Control prompt snapshot:

```bash
claude --system-prompt-snapshot off
```

---

## Output

```bash
--output-format text
--output-format json
--output-format stream-json
```

Example:

```bash
claude -p "List project issues" --output-format json
```

---

## Input

```bash
--input-format text
--input-format stream-json
```

---

## JSON schema

```bash
claude -p \
  --json-schema '{"type":"object","properties":{"summary":{"type":"string"}}}' \
  "Summarize this project"
```

---

## Budget / turns

```bash
--max-budget-usd 5.00
--max-turns 3
```

Example:

```bash
claude -p --max-budget-usd 5 --max-turns 5 "Investigate this bug"
```

---

## Debugging

```bash
claude --debug
claude --debug='mcp,startup'
claude --debug-file ./claude-debug.log
```

---

## Chrome

```bash
claude --chrome
claude --no-chrome
```

---

## Print mode

```bash
claude -p "query"
```

Useful scripting flags:

```bash
--output-format
--input-format
--json-schema
--max-budget-usd
--max-turns
--verbose
--include-hook-events
--include-partial-messages
```

---

## Plugins

Load plugin directory:

```bash
claude --plugin-dir ./my-plugin
```

Load multiple:

```bash
claude --plugin-dir ./plugin-a --plugin-dir ./plugin-b
```

Load plugin archive:

```bash
claude --plugin-dir ./my-plugin.zip
```

---

## MCP

```bash
claude --mcp-config ./mcp.json
```

---

## IDE

```bash
claude --ide
```

---

## Remote control

```bash
claude --remote-control
```

Short:

```bash
claude --rc
```

---

## Cloud

```bash
claude --cloud "Fix the login bug"
```

---

## Background

```bash
claude --background "Investigate flaky tests"
```

Short:

```bash
claude --bg "Investigate flaky tests"
```

---

## Background shell command

```bash
claude --bg --exec "mvn test"
```

---

## Safe / bare modes

Minimal:

```bash
claude --bare -p "query"
```

Safe troubleshooting mode:

```bash
claude --safe-mode
```

Restricted environment:

```bash
claude --restricted -p "query"
```

---

# 7. Keyboard Shortcuts

> Windows/Linux generally use `Ctrl`; macOS uses `Cmd` where applicable.

| Shortcut | Action |
|---|---|
| `Ctrl+C` | Interrupt current operation / clear input |
| `Ctrl+D` | Exit session |
| `Ctrl+G` | Open default text editor |
| `Ctrl+X Ctrl+E` | Open default editor |
| `Ctrl+L` | Redraw terminal |
| `Ctrl+O` | Toggle transcript viewer |
| `Ctrl+R` | Reverse-search command history |
| `Ctrl+B` | Background running task |
| `Ctrl+T` | Toggle task checklist |
| `Ctrl+S` | Stash/restore prompt |
| `Ctrl+Z` | Suspend Claude Code on Unix |
| `Esc` | Stop current response |
| `Esc Esc` | Clear draft / open rewind |
| `Ctrl+Enter` | Send queued messages |
| `Ctrl+X Ctrl+S` | Send queued messages |
| `Shift+Tab` | Cycle permission modes |
| `Alt+M` | Permission-mode cycle on supported Windows setups |
| `Option+P` / `Alt+P` | Switch model |
| `Option+T` / `Alt+T` | Toggle extended thinking where supported |
| `Option+O` / `Alt+O` | Toggle fast mode |
| `Ctrl+A` | Start of line |
| `Ctrl+E` | End of line |
| `Ctrl+K` | Delete to end of line |
| `Ctrl+U` | Delete to start of line |
| `Ctrl+W` | Delete previous whitespace-delimited word/path |
| `Ctrl+Y` | Paste deleted text |
| `Alt+B` | Move back one word |
| `Alt+F` | Move forward one word |
| `Alt+D` | Delete to end of word |
| `Up/Down` | Navigate prompt/history |
| `Tab` | Accept autocomplete |
| `Ctrl+V` | Paste image where supported |

---

# 8. Multiline Input

Depending on terminal:

```text
Shift+Enter
```

may insert a newline.

Use:

```text
/terminal-setup
```

to configure supported terminal behavior.

Alternative:

```text
Ctrl+G
```

opens the prompt in an external editor.

---

# 9. Shell Mode

Claude Code supports direct shell commands using `!`.

Example:

```text
!git status
```

```text
!mvn test
```

```text
!npm test
```

The command executes in the shell rather than asking Claude to reason about it first.

---

# 10. Custom Commands vs Skills

Modern Claude Code uses **Skills** as the primary mechanism for reusable custom commands.

Recommended structure:

```text
.claude/
├── skills/
│   ├── review-api/
│   │   └── SKILL.md
│   ├── springboot-service/
│   │   └── SKILL.md
│   └── create-test/
│       └── SKILL.md
└── commands/
    └── legacy-command.md
```

Older/custom command files under:

```text
.claude/commands/
```

can still be useful, but new reusable workflows should generally use Skills.

---

# 11. Creating a Custom Skill

Example:

```text
.claude/skills/create-service/SKILL.md
```

Example content:

```markdown
---
name: create-service
description: Create a production-ready Spring Boot service following this project's architecture.
---

# Create Spring Boot Service

When invoked:

1. Inspect the existing project structure.
2. Identify the package convention.
3. Create controller/service/repository/entity/dto classes as appropriate.
4. Follow existing exception handling.
5. Follow existing logging conventions.
6. Add validation.
7. Add tests.
8. Run the relevant tests.
9. Summarize all changed files.
```

Invoke:

```text
/create-service
```

or:

```text
/create-service PaymentPreferenceService
```

---

# 12. Skill Frontmatter

Common useful fields include:

```yaml
---
name: my-skill
description: What the skill does.
allowed-tools: Read, Grep, Glob
disable-model-invocation: true
user-invocable: true
context: fork
agent: Explore
argument-hint: <feature-name>
---
```

Use only fields supported by your installed Claude Code version.

---

# 13. Dynamic Custom Commands

Example:

```text
.claude/skills/create-api/SKILL.md
```

```markdown
---
name: create-api
description: Create a REST API following project conventions.
argument-hint: <resource>
---

Create a REST API for:

$ARGUMENTS

Before coding:

1. Inspect existing APIs.
2. Follow existing package structure.
3. Reuse existing response/error models.
4. Add validation.
5. Add tests.
6. Run tests.
7. Show changed files.
```

Invoke:

```text
/create-api PaymentPreference
```

---

# 14. Personal Skills

Personal Skills can be stored under:

```text
~/.claude/skills/
```

Example:

```text
~/.claude/skills/springboot-review/SKILL.md
```

These can be reused across projects.

---

# 15. Project Skills

Project-specific Skills:

```text
.claude/skills/
```

Example:

```text
project/
└── .claude/
    └── skills/
        ├── create-controller/
        ├── create-service/
        ├── review-api/
        ├── run-tests/
        └── database-review/
```

---

# 16. Legacy `.claude/commands`

Older custom command:

```text
.claude/commands/review-api.md
```

Example:

```markdown
Review the selected API.

Check:

1. REST conventions
2. HTTP status codes
3. Validation
4. Exception handling
5. Logging
6. Security
7. Performance
8. Tests

Do not modify code unless explicitly requested.
```

Invoke:

```text
/review-api
```

---

# 17. Custom Agent

Project agents:

```text
.claude/agents/
```

Example:

```text
.claude/agents/security-reviewer.md
```

Example:

```markdown
---
name: security-reviewer
description: Reviews backend code for security problems.
---

Review code for:

- authentication
- authorization
- injection
- secrets
- insecure deserialization
- sensitive data exposure
- API security
- logging of confidential information

Return findings with file paths and line numbers.
```

CLI dynamic agent example:

```bash
claude --agents '{"reviewer":{"description":"Reviews code","prompt":"Review code for correctness and security."}}'
```

---

# 18. CLAUDE.md

Recommended project structure:

```text
project/
├── CLAUDE.md
├── .claude/
│   ├── settings.json
│   ├── settings.local.json
│   ├── agents/
│   ├── commands/
│   ├── skills/
│   └── hooks/
└── src/
```

A good `CLAUDE.md` should contain:

```markdown
# Project Instructions

## Architecture
...

## Technology
...

## Coding Standards
...

## Testing
...

## Git Rules
...

## Security
...

## Commands
...

## Do Not
...
```

---

# 19. Hooks

Hooks automate actions around Claude Code lifecycle/tool events.

Typical uses:

```text
Before tool execution
After tool execution
Session start
Session end
Before compaction
After compaction
Notifications
Directory added
Worktree creation
```

Inspect:

```text
/hooks
```

Configure through settings:

```text
.claude/settings.json
```

or user settings:

```text
~/.claude/settings.json
```

---

# 20. Example Hook Concept

Example:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint"
          }
        ]
      }
    ]
  }
}
```

Always verify the current hook schema against the Claude Code documentation before copying production configuration.

---

# 21. MCP

MCP allows Claude Code to connect to external tools/data.

Typical MCP examples:

```text
GitHub
Slack
Databases
Browser tools
Internal APIs
Documentation systems
Cloud services
```

Check:

```text
/mcp
```

Example project configuration:

```text
.mcp.json
```

Example CLI:

```bash
claude --mcp-config ./mcp.json
```

Useful commands:

```text
/mcp
/mcp reconnect server-name
/mcp enable server-name
/mcp disable server-name
/mcp disable all
```

---

# 22. Plugins

Plugins can package:

```text
Skills
Agents
Hooks
MCP servers
LSP configuration
Other Claude Code extensions
```

Commands:

```text
/plugin
/plugin list
/plugin install <plugin>
/plugin enable <plugin>
/plugin disable <plugin>
/reload-plugins
/reload-plugins --force
```

Session-only plugin:

```bash
claude --plugin-dir ./my-plugin
```

---

# 23. Git Commands I Commonly Use With Claude Code

## Check state

```bash
git status
```

## Show branches

```bash
git branch
git branch -a
```

## Create and switch branch

```bash
git switch -c feature/payment-preference
```

Older equivalent:

```bash
git checkout -b feature/payment-preference
```

## Switch branch

```bash
git switch main
```

## Pull latest

```bash
git pull origin main
```

## Fetch

```bash
git fetch origin
```

## Diff

```bash
git diff
git diff --staged
```

## Stage

```bash
git add .
```

## Commit

```bash
git commit -m "feat: add payment preference API"
```

## Push

```bash
git push -u origin feature/payment-preference
```

## View history

```bash
git log --oneline --graph --decorate --all
```

## Remote

```bash
git remote -v
```

## Add remote

```bash
git remote add origin <repository-url>
```

---

# 24. Recommended Claude + Git Workflow

## Step 1 — Start

```bash
claude
```

## Step 2 — Understand project

```text
/init
```

Then:

```text
Explain the complete architecture of this project.
Do not modify anything.
```

## Step 3 — Plan

```text
/plan
```

## Step 4 — Implement

```text
Implement the approved plan.
Follow the existing architecture.
Do not introduce new dependencies unless necessary.
```

## Step 5 — Inspect changes

```text
/diff
```

## Step 6 — Test

```text
Run the relevant tests.
```

## Step 7 — Review

```text
/code-review high
```

## Step 8 — Security review

```text
/security-review
```

## Step 9 — Simplify

```text
/simplify
```

## Step 10 — Git

```bash
git status
git diff
git add .
git commit -m "feat: ..."
git push
```

---

# 25. Spring Boot Commands to Give Claude

## Understand project

```text
Analyze this Spring Boot project completely.

Explain:

1. application startup flow
2. controller layer
3. service layer
4. repository layer
5. entity/model layer
6. DTO mapping
7. exception handling
8. Spring Security
9. database configuration
10. Redis
11. Kafka
12. logging
13. tests

Do not modify code.
```

## Create REST API

```text
Create a production-ready Spring Boot REST API for <resource>.

First inspect existing APIs and follow the project's existing conventions.

Include:

- Controller
- Service
- Repository
- Entity if required
- Request DTO
- Response DTO
- Validation
- Exception handling
- Logging
- Swagger/OpenAPI
- Unit tests
- Integration tests where appropriate

Do not introduce a new architecture if an existing project pattern already exists.
```

## Review Spring Security

```text
Review the Spring Security implementation.

Trace:

Client
→ API Gateway
→ authentication filter
→ JWT extraction
→ JWT validation
→ SecurityContext
→ authorization
→ controller

Identify correctness, security, configuration, and performance issues.
Do not modify code yet.
```

---

# 26. Angular Commands to Give Claude

## Understand Angular project

```text
Analyze this Angular application.

Explain:

- components
- standalone components/modules
- services
- routing
- guards
- interceptors
- models/interfaces
- state management
- HTTP calls
- authentication
- lazy loading
- environment configuration
- error handling
- testing

Do not modify anything.
```

## Create feature

```text
Implement the <feature> Angular feature.

First inspect existing patterns.
Reuse existing services/components/models.
Do not introduce unnecessary dependencies.
Add routing, guards, API integration, validation, error handling, and tests where appropriate.
```

---

# 27. FastAPI Commands to Give Claude

```text
Analyze this FastAPI backend.

Explain:

- application startup
- routers
- dependencies
- services
- SQLAlchemy
- Pydantic
- database session management
- Alembic
- authentication
- Redis
- Celery
- background tasks
- exception handling
- logging
- tests

Do not modify anything.
```

---

# 28. Docker Commands to Give Claude

```text
Analyze the Docker setup.

Check:

- Dockerfile
- Docker Compose
- networks
- volumes
- environment variables
- secrets
- health checks
- service dependencies
- ports
- resource limits
- production readiness

Do not modify anything.
```

---

# 29. AWS Commands to Give Claude

```text
Review the AWS deployment architecture.

Trace:

Developer
→ Git
→ CI/CD
→ Docker build
→ ECR
→ ECS/EKS/EC2
→ Load Balancer
→ application
→ RDS
→ Redis
→ S3
→ CloudFront
→ Route 53

Identify missing production concerns without changing code.
```

---

# 30. Database Review Prompt

```text
Review the database implementation.

Check:

- schema design
- relationships
- indexes
- constraints
- transactions
- isolation
- N+1 queries
- pagination
- locking
- migrations
- connection pool
- query performance

Return findings with file names and recommended fixes.
Do not modify code.
```

---

# 31. API Review Prompt

```text
Review this REST API.

Check:

- URL design
- HTTP methods
- status codes
- request DTOs
- response DTOs
- validation
- error responses
- pagination
- filtering
- sorting
- authentication
- authorization
- idempotency
- logging
- observability
- Swagger/OpenAPI
- tests

Do not modify code.
```

---

# 32. Testing Prompt

```text
Analyze the current test coverage.

Identify:

1. missing unit tests
2. missing integration tests
3. edge cases
4. negative cases
5. security cases
6. database cases
7. concurrency cases
8. API contract cases

Then propose the test plan before writing tests.
```

---

# 33. Debugging Workflow

When something breaks:

```text
/debug
```

Then:

```text
Investigate this error.

Do not immediately modify code.

First:
1. reproduce the issue
2. identify the failing layer
3. trace the execution path
4. inspect relevant configuration
5. identify root cause
6. explain why it happens
7. propose the smallest safe fix

Only modify after explaining the root cause.
```

---

# 34. Refactoring Workflow

```text
/plan
```

Then:

```text
Analyze this code for refactoring opportunities.

Constraints:

- preserve behavior
- preserve API compatibility
- do not change database schema unless required
- avoid unnecessary abstractions
- follow existing project conventions
- add/update tests

First provide the plan.
```

Then:

```text
Implement the approved refactoring.
```

Then:

```text
/diff
/code-review high
/simplify
```

---

# 35. Safe "Do Not Modify" Prompt

Use this whenever you only want analysis:

```text
Analyze this codebase and explain the issue.

DO NOT:
- modify files
- create files
- delete files
- run destructive commands
- change configuration

Only inspect and explain.
```

---

# 36. "Modify Only Approved Files" Prompt

```text
Modify only these files:

- <file1>
- <file2>

Do not modify any other files.

If another file must change, stop and explain why before modifying it.
```

---

# 37. "Smallest Safe Change" Prompt

```text
Fix the issue using the smallest safe change.

Requirements:

- preserve existing behavior
- do not refactor unrelated code
- do not add dependencies unless necessary
- do not rename public APIs unless required
- add/update tests
- show changed files
- explain root cause
```

---

# 38. "Production Review" Prompt

```text
Review this implementation as production code.

Check:

- correctness
- security
- performance
- scalability
- maintainability
- observability
- error handling
- concurrency
- database behavior
- API compatibility
- testing
- deployment concerns

Separate:
1. confirmed bugs
2. security risks
3. performance risks
4. maintainability issues
5. optional improvements

Do not modify code.
```

---

# 39. "Explain Before Code" Prompt

```text
Before writing code:

1. inspect the existing implementation
2. explain the current flow
3. identify the exact problem
4. explain the proposed solution
5. list files that will change
6. wait for approval

Do not modify files yet.
```

---

# 40. Claude Code Session Patterns

## New task

```text
/clear
```

## Long conversation

```text
/context
/compact
```

## Complex change

```text
/plan
```

## Parallel investigation

```text
/subtask inspect database queries
/subtask inspect API security
/subtask inspect tests
```

## Review

```text
/diff
/code-review high
/security-review
/simplify
```

## Resume tomorrow

```bash
claude --resume <session>
```

or:

```text
/resume
```

---

# 41. Useful Shell Commands With Claude

## Java / Maven

```bash
mvn clean
mvn test
mvn clean test
mvn spring-boot:run
mvn package
mvn clean package
```

## Gradle

```bash
./gradlew test
./gradlew clean build
./gradlew bootRun
```

Windows:

```powershell
.\gradlew.bat test
.\gradlew.bat bootRun
```

## Angular

```bash
npm install
npm start
npm run build
npm test
ng serve
ng build
```

## FastAPI

```bash
uvicorn app.main:app --reload
pytest
pytest -v
```

## Docker

```bash
docker build .
docker compose up
docker compose up -d
docker compose down
docker compose ps
docker compose logs
docker compose logs -f
docker ps
docker images
```

---

# 42. Claude + Git Branch Creation

Typical workflow:

```bash
git status
git switch main
git pull origin main
git switch -c feature/payment-preference
claude
```

Inside Claude:

```text
Analyze the existing payment preference implementation.
Do not modify anything.
```

Then:

```text
/plan
```

Implement.

Then:

```text
/diff
/code-review high
```

Finally:

```bash
git status
git add .
git commit -m "feat: implement payment preference"
git push -u origin feature/payment-preference
```

---

# 43. Claude + Pull Request Workflow

```text
/diff
```

Then:

```text
/code-review high
```

Fix findings.

Then:

```text
/security-review
```

Then:

```bash
git status
git push
```

If using GitHub CLI:

```bash
gh pr create
gh pr status
gh pr view
gh pr checks
```

---

# 44. Claude Code Project Structure

Recommended:

```text
project/
│
├── CLAUDE.md
│
├── .claude/
│   ├── settings.json
│   ├── settings.local.json
│   │
│   ├── agents/
│   │   └── security-reviewer.md
│   │
│   ├── commands/
│   │   └── legacy-command.md
│   │
│   ├── skills/
│   │   ├── create-api/
│   │   │   └── SKILL.md
│   │   ├── review-api/
│   │   │   └── SKILL.md
│   │   └── springboot-service/
│   │       └── SKILL.md
│   │
│   └── hooks/
│
├── .mcp.json
│
└── src/
```

---

# 45. Recommended Personal Custom Skills

For a Spring Boot + Angular + FastAPI project, useful custom Skills include:

```text
/create-api
/create-service
/create-controller
/create-dto
/create-entity
/create-repository
/create-test
/review-api
/review-security
/review-database
/review-performance
/explain-flow
/debug-error
/review-logging
/review-swagger
/review-spring-security
/review-angular
/review-fastapi
/review-docker
/review-aws
```

These are **custom Skills you create**; they are not necessarily built-in Claude Code commands.

---

# 46. Suggested Custom Skill: `/explain-flow`

File:

```text
.claude/skills/explain-flow/SKILL.md
```

```markdown
---
name: explain-flow
description: Explain the complete execution flow of a feature through the application.
---

Analyze the requested feature.

Explain:

1. Client request
2. Controller/router
3. Security/authentication
4. Service layer
5. Repository/data-access layer
6. Database/cache/external services
7. Response mapping
8. Exception handling
9. Logging/observability

Use actual class names and method names from the project.

Do not modify code.
```

---

# 47. Suggested Custom Skill: `/review-api`

```markdown
---
name: review-api
description: Perform a production-style REST API review.
---

Review the requested API for:

- REST design
- HTTP methods
- status codes
- DTO design
- validation
- exception handling
- authentication
- authorization
- pagination
- filtering
- sorting
- idempotency
- logging
- OpenAPI/Swagger
- performance
- tests

Separate confirmed problems from optional improvements.

Do not modify code unless explicitly requested.
```

---

# 48. Suggested Custom Skill: `/create-springboot-service`

```markdown
---
name: create-springboot-service
description: Create a Spring Boot service following the existing project architecture.
argument-hint: <feature>
---

Create the service for:

$ARGUMENTS

First inspect existing services.

Follow existing conventions for:

- packages
- entities
- DTOs
- repositories
- services
- controllers
- validation
- exceptions
- logging
- security
- Swagger/OpenAPI
- tests

Do not invent a new architecture when an existing project convention exists.
```

---

# 49. Common Claude Mistakes to Avoid

## Do not blindly say:

```text
Fix everything.
```

Instead specify:

```text
Identify all confirmed problems first.
Do not modify code.
Then propose a prioritized plan.
```

## Do not ask for a huge refactor without constraints.

Use:

```text
Preserve public APIs.
Preserve database schema.
Do not introduce dependencies.
Modify only required files.
```

## Do not trust generated tests automatically.

Ask:

```text
Verify that the tests actually fail before the fix and pass after the fix.
```

## Do not assume a successful build means the feature works.

Use:

```text
/run
```

when application-level behavior must be verified.

---

# 50. Most Useful Daily Cheat Sheet

```text
/init
```

```text
/status
```

```text
/context
```

```text
/compact
```

```text
/plan
```

```text
/diff
```

```text
/code-review high
```

```text
/security-review
```

```text
/simplify
```

```text
/verify
```

```text
/run
```

```text
/permissions
```

```text
/mcp
```

```text
/skills
```

```text
/reload-skills
```

```text
/tasks
```

```text
/agents
```

```text
/clear
```

```text
/resume
```

```text
/rewind
```

```text
/exit
```

---

# 51. Current Command Discovery

When this document becomes outdated, use Claude itself:

```text
/help
```

List Skills:

```text
/skills
```

Check Claude Code version:

```bash
claude --version
```

Check CLI options:

```bash
claude --help
```

Check diagnostics:

```bash
claude doctor
```

Official command reference:

```text
https://code.claude.com/docs/en/commands
```

Official CLI reference:

```text
https://code.claude.com/docs/en/cli-reference
```

---

# 52. Version Tracking

Keep this section updated whenever Claude Code changes.

```text
Claude Code version checked:
<run `claude --version`>

Last documentation check:
2026-09-26

Official docs:
https://code.claude.com/docs/en/commands
https://code.claude.com/docs/en/cli-reference
https://code.claude.com/docs/en/interactive-mode
https://code.claude.com/docs/en/skills
```

---

# 53. My Custom Commands

> Add your own commands here as you create them.

## Custom command template

```markdown
### `/my-command`

**Purpose:** 

**File:**

```text
.claude/skills/my-command/SKILL.md
```

**Usage:**

```text
/my-command <argument>
```

**What it does:**

1.
2.
3.

**Example:**

```text
/my-command example
```

**Notes:**
- 
```

---

# 54. My Project-Specific Commands

> Replace these placeholders with your real custom Skills.

| Command | Type | Purpose | File |
|---|---|---|---|
| `/create-api` | Custom Skill | Create REST API | `.claude/skills/create-api/SKILL.md` |
| `/review-api` | Custom Skill | Review REST API | `.claude/skills/review-api/SKILL.md` |
| `/create-test` | Custom Skill | Create tests | `.claude/skills/create-test/SKILL.md` |
| `/debug-error` | Custom Skill | Investigate error | `.claude/skills/debug-error/SKILL.md` |
| `/explain-flow` | Custom Skill | Explain execution flow | `.claude/skills/explain-flow/SKILL.md` |
| `/springboot-review` | Custom Skill | Review Spring Boot code | `.claude/skills/springboot-review/SKILL.md` |
| `/angular-review` | Custom Skill | Review Angular code | `.claude/skills/angular-review/SKILL.md` |
| `/fastapi-review` | Custom Skill | Review FastAPI code | `.claude/skills/fastapi-review/SKILL.md` |
| `/docker-review` | Custom Skill | Review Docker setup | `.claude/skills/docker-review/SKILL.md` |
| `/aws-review` | Custom Skill | Review AWS architecture | `.claude/skills/aws-review/SKILL.md` |

---

# 55. Final Daily Workflow

For a normal feature:

```text
/status
```

```text
/plan <feature>
```

Implement:

```text
Implement the approved plan.
Follow existing project conventions.
Add/update tests.
```

Inspect:

```text
/diff
```

Review:

```text
/code-review high
```

Security:

```text
/security-review
```

Cleanup:

```text
/simplify
```

Verify:

```text
/verify
```

Run:

```text
/run
```

Then Git:

```bash
git status
git diff
git add .
git commit -m "feat: <description>"
git push
```

---

# 56. Important Rule

This file is a **reference**, not a replacement for Claude Code's live command discovery.

If a command in this file does not work:

1. Run `claude --version`.
2. Run `/help`.
3. Run `/skills`.
4. Run `claude --help`.
5. Check the official documentation.
6. Check whether the command is platform/plan/provider dependent.

Claude Code evolves quickly, so version-specific commands should always be treated as version-dependent.
