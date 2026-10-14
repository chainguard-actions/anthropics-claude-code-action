<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.250

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.250** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a): `${{ steps.run.outputs.github_token }}` is directly interpolated inside a `run:` shell command in the 'Revoke app token' step. The expression is embedded in a curl `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` header, meaning the value is substituted by the YAML template engine before the shell ever sees it. A `steps.*.outputs.*` value is an untrusted-input source per the check scope.

Locations:

- `action.yml:453`

### script-injection (severity: high)

Rule (a): `${{ github.action_path }}` is directly interpolated inside a `run:` shell command: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression directly inside a `run:` script is a script-injection finding regardless of which context it reads from.

Locations:

- `agent-approval-check/action.yml:57`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern appears twice — once inside a `timeout` wrapper and once in the `else` branch. The script is not downloaded to a file first and verified before execution.

Locations:

- `base-action/action.yml:154`
- `base-action/action.yml:156`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, `$BUN_DIR` is derived from `$PATH_TO_BUN_EXECUTABLE` (which is set from `inputs.path_to_bun_executable`) and written to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled newline in the input value could inject arbitrary entries into PATH. This is rule (d): indirect write of inputs via env var without sanitization.

Locations:

- `action.yml:234`
- `base-action/action.yml:134`

### github-env-injection (severity: high)

In the 'Install Claude Code' step, `$CLAUDE_DIR` is derived from `$PATH_TO_CLAUDE_CODE_EXECUTABLE` (which is set from `inputs.path_to_claude_code_executable`) and written to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled newline in the input value could inject arbitrary entries into PATH. This is rule (d): indirect write of inputs via env var without sanitization.

Locations:

- `base-action/action.yml:169`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell, github-env-injection

**Notes:**

Fixed 5 findings across 3 files:

1. action.yml (script-injection, line 453): Moved `${{ steps.run.outputs.github_token }}` to env block as GITHUB_TOKEN_TO_REVOKE in the 'Revoke app token' step.

2. agent-approval-check/action.yml (script-injection, line 57): Moved `${{ github.action_path }}` to the step's env block as ACTION_PATH, merged with existing env block to avoid duplicates.

3. base-action/action.yml (unsafe-shell, lines 154/156): Replaced both `curl ... | bash -s -- $VERSION` patterns with download-then-execute: `curl -fsSL ... -o "$INSTALL_SCRIPT"` followed by `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped `-s` and `--` as required since the script is no longer read from stdin.

4. action.yml (github-env-injection, line 234): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to GITHUB_PATH in 'Setup Custom Bun Path' step.

5. base-action/action.yml (github-env-injection, lines 134/169): Added sanitization for both BUN_DIR (line 134) and CLAUDE_DIR (line 169) before writing to GITHUB_PATH.

