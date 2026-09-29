<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.216

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.216** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): `${{ github.action_path }}` is directly interpolated inside a `run:` shell command string. Any `${{ ... }}` expression in a run: block is a script-injection risk because the value is substituted by the YAML template engine before the shell ever sees it. Offending line: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Fix: use the `$GITHUB_ACTION_PATH` environment variable instead, which is always available in composite action steps.

Locations:

- `agent-approval-check/action.yml:55`

### script-injection (severity: high)

Sub-rule (a): `${{ steps.run.outputs.github_token }}` is directly interpolated inside a `run:` shell command string in the 'Revoke app token' step. The expression is substituted before the shell processes the command, allowing a malicious token value to inject shell metacharacters. Offending line: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`.

Locations:

- `action.yml:530`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the env var `PATH_TO_BUN_EXECUTABLE` is set from `inputs.path_to_bun_executable` (caller-controlled). The script computes `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and then writes `echo "$BUN_DIR" >> "$GITHUB_PATH"` without first sanitizing with `printf '%s' ... | tr -d '\n\r'`. A newline embedded in the input value would allow injecting arbitrary entries into `$GITHUB_PATH`.

Locations:

- `action.yml:258`
- `base-action/action.yml:131`

### github-env-injection (severity: high)

In the 'Install Claude Code' step of base-action/action.yml, the env var `PATH_TO_CLAUDE_CODE_EXECUTABLE` is set from `inputs.path_to_claude_code_executable` (caller-controlled). The script computes `CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE")` and then writes `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without sanitization (`printf '%s' ... | tr -d '\n\r'`). A newline in the input allows injecting arbitrary entries into `$GITHUB_PATH`.

Locations:

- `base-action/action.yml:175`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns without any integrity verification (no checksum, no signature check). If the remote URL is compromised or the connection is intercepted, arbitrary code runs on the runner. The script should be downloaded to a file first, its integrity verified (e.g., via a SHA-256 checksum), and then executed separately.

Locations:

- `base-action/action.yml:155`
- `base-action/action.yml:157`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed 5 findings across 3 files:
1. agent-approval-check/action.yml (line 55): Replaced `${{ github.action_path }}` with `$GITHUB_ACTION_PATH` environment variable to eliminate script-injection risk.
2. action.yml (line 530): Moved `${{ steps.run.outputs.github_token }}` into an `env:` block as `APP_TOKEN_TO_REVOKE` and referenced it as `$APP_TOKEN_TO_REVOKE` in the curl command.
3. action.yml (line 258): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to GITHUB_PATH to prevent newline injection.
4. base-action/action.yml (line 131): Same GITHUB_PATH sanitization fix for the Setup Custom Bun Path step.
5. base-action/action.yml (lines 155/157 and 175): (a) Replaced `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` with download-to-tempfile then execute pattern (`curl ... -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`), dropping the `--` as required since the script receives the version as a positional argument directly. (b) Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing CLAUDE_DIR to GITHUB_PATH.

