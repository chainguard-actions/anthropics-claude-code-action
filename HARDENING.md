<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.236

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.236** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A GitHub Actions expression `${{ steps.run.outputs.github_token }}` is directly interpolated inside a `run:` shell command string in the 'Revoke app token' step. The value is embedded literally into the curl command's `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` line before the shell ever sees it, allowing newlines or shell metacharacters in the token value to break out of the string context. The fix is to route the value through an env: variable and reference it as `$GITHUB_TOKEN` in the shell.

Locations:

- `action.yml:497`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the caller-controlled input `inputs.path_to_bun_executable` is placed into the `PATH_TO_BUN_EXECUTABLE` env var, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` is computed and written to `$GITHUB_PATH` via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required `printf '%s' ... | tr -d '\n\r'` sanitization. A newline embedded in the input value would inject an arbitrary entry into GITHUB_PATH.

Locations:

- `action.yml:234`
- `base-action/action.yml:143`

### github-env-injection (severity: high)

In the 'Install Claude Code' step of base-action/action.yml, the caller-controlled input `inputs.path_to_claude_code_executable` is placed into the `PATH_TO_CLAUDE_CODE_EXECUTABLE` env var, then `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` is computed and written to `$GITHUB_PATH` via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required `printf '%s' ... | tr -d '\n\r'` sanitization. A newline embedded in the input value would inject an arbitrary entry into GITHUB_PATH.

Locations:

- `base-action/action.yml:180`

### unsafe-shell (severity: high)

In the 'Install Claude Code' step of base-action/action.yml, the script is fetched and executed in a single pipeline: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (and the same pattern inside a `bash -c` timeout wrapper). Remote content is piped directly to bash without first downloading and verifying the script. A compromised or MITM'd response would execute arbitrary code on the runner.

Locations:

- `base-action/action.yml:165`
- `base-action/action.yml:167`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 4 findings across action.yml and base-action/action.yml:
1. script-injection (action.yml line 497): Moved `${{ steps.run.outputs.github_token }}` into an `env:` block as `APP_TOKEN` and referenced it as `$APP_TOKEN` in the curl command.
2. github-env-injection (action.yml line 234): Added `printf '%s' ... | tr -d '\n\r'` sanitization of BUN_DIR before writing to $GITHUB_PATH.
3. github-env-injection (base-action/action.yml line 143): Same BUN_DIR sanitization fix.
4. github-env-injection (base-action/action.yml line 180): Added sanitization of CLAUDE_DIR before writing to $GITHUB_PATH.
5. unsafe-shell (base-action/action.yml lines 165/167): Replaced `curl ... | bash -s -- $VERSION` pipe pattern with download-then-execute: curl downloads to a temp file, then `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"` executes it (dropping the `--` shell option terminator as required). Applied to both the timeout-wrapped and fallback execution paths.

### Iteration 2

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in hardened/action/agent-approval-check/action.yml line 53: replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. The $GITHUB_ACTION_PATH environment variable is set automatically by the GitHub Actions runner and is equivalent in value, but avoids the YAML template substitution that causes the script-injection finding.

