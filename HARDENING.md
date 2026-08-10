<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.179

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.179** was hardened automatically. 6 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A `${{ steps.run.outputs.github_token }}` expression is interpolated directly inside a `run:` shell command string in the 'Revoke app token' step. The offending line is: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any `${{ ... }}` expression inside a `run:` block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it, allowing an attacker-controlled value to inject shell metacharacters.

Locations:

- `action.yml:374`

### script-injection (severity: high)

Sub-rule (a): A `${{ github.action_path }}` expression is interpolated directly inside a `run:` shell command string. The offending line is: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression inside a `run:` block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it.

Locations:

- `agent-approval-check/action.yml:57`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from the untrusted input `inputs.path_to_bun_executable` to `$GITHUB_PATH` without sanitization. The env var `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed, and `echo "$BUN_DIR" >> "$GITHUB_PATH"` is executed without the required `printf '%s' ... | tr -d '\n\r'` sanitization step. A newline in the input could inject arbitrary entries into PATH.

Locations:

- `action.yml:213`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value derived from the untrusted input `inputs.path_to_bun_executable` to `$GITHUB_PATH` without sanitization. The env var `PATH_TO_BUN_EXECUTABLE` is set from `${{ inputs.path_to_bun_executable }}`, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed, and `echo "$BUN_DIR" >> "$GITHUB_PATH"` is executed without the required `printf '%s' ... | tr -d '\n\r'` sanitization step.

Locations:

- `base-action/action.yml:133`

### github-env-injection (severity: high)

The 'Install Claude Code' step writes a value derived from the untrusted input `inputs.path_to_claude_code_executable` to `$GITHUB_PATH` without sanitization. The env var `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `${{ inputs.path_to_claude_code_executable }}`, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is computed, and `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` is executed without the required `printf '%s' ... | tr -d '\n\r'` sanitization step.

Locations:

- `base-action/action.yml:162`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to a shell interpreter: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns without any integrity verification. If the remote URL is compromised or the response is tampered with in transit, arbitrary code will execute on the runner.

Locations:

- `base-action/action.yml:155`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 6 findings across 3 files:

1. action.yml (Revoke app token, line 374): Moved `${{ steps.run.outputs.github_token }}` into an `env:` block as `APP_TOKEN` and referenced `$APP_TOKEN` in the shell script.

2. agent-approval-check/action.yml (line 57): Moved `${{ github.action_path }}` into the existing `env:` block as `ACTION_PATH` and referenced `$ACTION_PATH` in the python command.

3. action.yml (Setup Custom Bun Path, line 213): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

4. base-action/action.yml (Setup Custom Bun Path, line 133): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

5. base-action/action.yml (Install Claude Code, line 162): Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

6. base-action/action.yml (Install Claude Code, line 155): Replaced `curl ... | bash -s -- $CLAUDE_CODE_VERSION` pipe with download-then-execute pattern: download to a temp file with `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT"`, then execute with `bash "$INSTALL_SCRIPT" $CLAUDE_CODE_VERSION` (dropping `-s` and `--` as required). Temp file is cleaned up after use.

### Iteration 2

**Fixes applied:** script-injection, unpinned-uses, missing-permissions, unsafe-shell

**Notes:**

Fixed all four findings across 8 workflow files:

1. **unpinned-uses**: Pinned actions/checkout@v6 → @d23441a48e516b6c34aea4fa41551a30e30af803, oven-sh/setup-bun@v2 → @0c5077e51419868618aeaa5fe8019c62421857d6, oven-sh/setup-bun@v1 → @f4d14e03ff726c06358e5557344e1da148b56cf7, anthropics/claude-code-action@v1 and @main → @6b082c41935b4c8a3b8b0ef85ba4ba4d9eeb8975 in ci.yml, claude-review.yml, claude.yml, issue-triage.yml, and release.yml.

2. **missing-permissions**: Added `permissions: contents: read` top-level block to ci.yml.

3. **script-injection**: Moved all ${{ }} expressions out of run: shell strings into env: blocks in release.yml (7 locations), sync-base-action.yml (deploy key), test-base-action.yml (4 locations), test-custom-executables.yml (2 locations), test-settings.yml (6 locations), and test-structured-output.yml (6 OUTPUT locations + summary step rewritten to use shell conditionals instead of ${{ ternary expressions }}).

4. **unsafe-shell**: Fixed test-custom-executables.yml: both curl-pipe-bash patterns now download to a mktemp file first, then execute the file. Dropped the `-s` flag (no longer reading from stdin) and the `--` separator (was the shell's option terminator, not the script's argument) from the claude.ai install invocation, passing `latest` directly as $1.

