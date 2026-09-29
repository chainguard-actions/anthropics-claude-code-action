<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.215

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.215** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside the run: shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. The `steps.*.outputs.*` context flows through YAML template substitution before the shell processes it, enabling script injection if the output value contains shell metacharacters.

Locations:

- `action.yml:490`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes `$BUN_DIR` (derived from `inputs.path_to_bun_executable` via the `PATH_TO_BUN_EXECUTABLE` env var) to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled `path_to_bun_executable` input containing embedded newlines could inject arbitrary entries into GITHUB_PATH. The same pattern exists in both action.yml and base-action/action.yml.

Locations:

- `action.yml:232`
- `base-action/action.yml:120`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes a remote script directly to a shell interpreter: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and a second occurrence in the else branch). The script is not downloaded to a file first and verified before execution, making this an unsafe-shell pattern.

Locations:

- `base-action/action.yml:155`
- `base-action/action.yml:157`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed three security findings: (1) script-injection in action.yml 'Revoke app token' step: moved ${{ steps.run.outputs.github_token }} from the run: shell string into the env: block as APP_TOKEN, referenced as $APP_TOKEN in the curl command. (2) github-env-injection in both action.yml and base-action/action.yml 'Setup Custom Bun Path' steps: added sanitization of BUN_DIR with `printf '%s' "$BUN_DIR" | tr -d '\n\r'` before writing to $GITHUB_PATH. (3) unsafe-shell in base-action/action.yml 'Install Claude Code' step: replaced both `curl ... | bash -s -- $CLAUDE_CODE_VERSION` occurrences with download-then-execute pattern using a mktemp file; dropped the '--' (it was the shell's option terminator in the pipe form, not a script argument); temp file is cleaned up after installation.

### Iteration 2

**Fixes applied:** script-injection, github-env-injection

**Notes:**

1. agent-approval-check/action.yml line 57: Moved `${{ github.action_path }}` from the `run:` shell string into an `env:` variable `ACTION_PATH`, then referenced it as `$ACTION_PATH` in the shell command to prevent script injection. 2. base-action/action.yml line 164: Added newline sanitization for `CLAUDE_DIR` before writing to `$GITHUB_PATH` — `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` — mirroring the existing pattern used for the custom Bun path in the same file.

