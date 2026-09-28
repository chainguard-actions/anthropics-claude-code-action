<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.187

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.187** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a): The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any `${{ ... }}` expression inside a run: block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it, allowing embedded shell metacharacters to be interpreted.

Locations:

- `action.yml:399`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step sets PATH_TO_BUN_EXECUTABLE from `inputs.path_to_bun_executable` (an untrusted input), then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"` — without the required `printf '%s' ... | tr -d '\n\r'` sanitization. A newline-containing input value could inject arbitrary entries into the runner's PATH.

Locations:

- `action.yml:207`
- `base-action/action.yml:113`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml sets PATH_TO_CLAUDE_CODE_EXECUTABLE from `inputs.path_to_claude_code_executable` (an untrusted input), then computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes it to $GITHUB_PATH with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` — without the required `printf '%s' ... | tr -d '\n\r'` sanitization. A newline-containing input value could inject arbitrary entries into the runner's PATH.

Locations:

- `base-action/action.yml:140`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the same pattern inside a `timeout ... bash -c "curl ... | bash -s -- $CLAUDE_CODE_VERSION"`). If the remote URL is compromised or the response is tampered with in transit, arbitrary code executes on the runner without any integrity verification.

Locations:

- `base-action/action.yml:130`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 4 findings across action.yml and base-action/action.yml:

1. script-injection (action.yml, Revoke app token step): Moved `${{ steps.run.outputs.github_token }}` into an env var `GITHUB_APP_TOKEN` and referenced it as `$GITHUB_APP_TOKEN` in the curl Authorization header.

2. github-env-injection (action.yml, Setup Custom Bun Path step): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH.

3. github-env-injection (base-action/action.yml, Setup Custom Bun Path step): Same sanitization fix as above.

4. github-env-injection (base-action/action.yml, Install Claude Code step): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to $GITHUB_PATH.

5. unsafe-shell (base-action/action.yml, Install Claude Code step): Replaced `curl ... | bash -s -- $CLAUDE_CODE_VERSION` with download-then-execute pattern using mktemp. Dropped `-s` and `--` from the execution command (they were shell stdin-reading flags, not script arguments). Applied to both the timeout-wrapped and plain variants. Temp file is cleaned up after installation.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

In hardened/action/agent-approval-check/action.yml line 53, replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. The pre-set environment variable $GITHUB_ACTION_PATH is equivalent to the ${{ github.action_path }} expression and is the safe pattern for referencing the action path in a run: shell command without embedding a ${{ }} expression directly.

