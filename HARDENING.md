<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.195

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.195** was hardened automatically. 6 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command. In the 'Revoke app token' step, `${{ steps.run.outputs.github_token }}` is embedded directly in the curl Authorization header shell string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. This causes GitHub Actions to substitute the value into the shell command before the shell ever sees it, enabling script injection if the token value contains shell metacharacters.

Locations:

- `action.yml:490`

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is interpolated directly inside a run: shell command. In agent-approval-check/action.yml, the step `- run: python "${{ github.action_path }}/agent_approval_check.py"` embeds `${{ github.action_path }}` directly in the shell command string. Any ${{ ... }} expression inside a run: block is a script-injection finding regardless of which context it reads from, as the value flows through YAML template substitution before the shell processes it.

Locations:

- `agent-approval-check/action.yml:55`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps `inputs.path_to_bun_executable` into the env var `PATH_TO_BUN_EXECUTABLE`, then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to $GITHUB_PATH via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled `path_to_bun_executable` input containing newlines can inject arbitrary entries into $GITHUB_PATH.

Locations:

- `action.yml:152`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step maps `inputs.path_to_bun_executable` into the env var `PATH_TO_BUN_EXECUTABLE`, then computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and writes it to $GITHUB_PATH via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled `path_to_bun_executable` input containing newlines can inject arbitrary entries into $GITHUB_PATH.

Locations:

- `base-action/action.yml:121`

### github-env-injection (severity: high)

The 'Install Claude Code' step maps `inputs.path_to_claude_code_executable` into the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE`, then computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and writes it to $GITHUB_PATH via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled `path_to_claude_code_executable` input containing newlines can inject arbitrary entries into $GITHUB_PATH.

Locations:

- `base-action/action.yml:150`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash in two places: (1) `timeout --foreground --kill-after=10 120 bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. Piping a remotely-fetched script directly to bash without first downloading and verifying it means a compromised or MITM'd install.sh would execute arbitrary code on the runner.

Locations:

- `base-action/action.yml:148`
- `base-action/action.yml:150`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 6 findings across 3 files:

1. action.yml (Revoke app token, line 490): Moved `${{ steps.run.outputs.github_token }}` into env block as APP_TOKEN; shell now uses `$APP_TOKEN`.

2. agent-approval-check/action.yml (line 55): Moved `${{ github.action_path }}` into env block as ACTION_PATH; merged with existing env block; shell now uses `$ACTION_PATH`.

3. action.yml (Setup Custom Bun Path, line 152): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

4. base-action/action.yml (Setup Custom Bun Path, line 121): Same sanitization fix as #3.

5. base-action/action.yml (Install Claude Code, line 150): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH.

6. base-action/action.yml (Install Claude Code, lines 148/150): Replaced both `curl | bash -s -- $VERSION` patterns with download-then-execute approach using a temp file (`mktemp`). The `--` was dropped per instructions since it was the shell's option terminator for the pipe form, not the script's own argument.

