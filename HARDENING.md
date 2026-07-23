<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.169

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.169** was hardened automatically. 5 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): `${{ github.action_path }}` is directly interpolated inside a `run:` shell command string. Before the shell ever sees the command, GitHub Actions performs YAML template substitution, so any value containing shell metacharacters could alter the command. The offending line is: `run: python "${{ github.action_path }}/agent_approval_check.py"`. The value should be passed via an `env:` variable and then referenced as `"$ENV_VAR"` in the script.

Locations:

- `agent-approval-check/action.yml:56`

### script-injection (severity: high)

Sub-rule (a): `${{ steps.run.outputs.github_token }}` is directly interpolated inside a `run:` shell command string in the 'Revoke app token' step. The offending line is: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Even though this is a step output (not direct user input), it still flows through YAML template substitution before the shell processes it. The token value should be placed in an `env:` variable and referenced as `"$TOKEN"` in the script.

Locations:

- `action.yml:440`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the value of `$BUN_DIR` — derived from `inputs.path_to_bun_executable` via `dirname "$PATH_TO_BUN_EXECUTABLE"` — is written directly to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing embedded newlines could inject arbitrary entries into GITHUB_PATH. The same pattern exists in base-action/action.yml. Fix: `safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r'); echo "$safe" >> "$GITHUB_PATH"`.

Locations:

- `action.yml:200`
- `base-action/action.yml:115`

### github-env-injection (severity: high)

In the 'Install Claude Code' step of base-action/action.yml, the value of `$CLAUDE_DIR` — derived from `inputs.path_to_claude_code_executable` via `dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"` — is written directly to `$GITHUB_PATH` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). An attacker-controlled input containing embedded newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `base-action/action.yml:145`

### unsafe-shell (severity: high)

In the 'Install Claude Code' step, remote content is fetched and piped directly to bash without first saving to a file for inspection: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` (appears twice — once inside a `timeout` wrapper and once in the else branch). If the remote URL is compromised or redirected, arbitrary code executes immediately on the runner. The script should be downloaded to a temporary file, its integrity verified (e.g., checksum), and then executed separately.

Locations:

- `base-action/action.yml:128`
- `base-action/action.yml:131`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 5 findings across 3 files:

1. agent-approval-check/action.yml (script-injection): Moved `${{ github.action_path }}` into an `env:` variable `ACTION_PATH` and merged it with the existing env block. The run command now references `"$ACTION_PATH/agent_approval_check.py"`.

2. action.yml (script-injection, Revoke app token step): Moved `${{ steps.run.outputs.github_token }}` into an `env:` variable `APP_TOKEN`. The curl Authorization header now uses `$APP_TOKEN`.

3. action.yml (github-env-injection, Setup Custom Bun Path): Added `safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

4. base-action/action.yml (github-env-injection, Setup Custom Bun Path): Added `safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

5. base-action/action.yml (github-env-injection, Install Claude Code): Added `safe=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` sanitization before writing to `$GITHUB_PATH`.

6. base-action/action.yml (unsafe-shell, Install Claude Code): Replaced both `curl ... | bash` patterns with download-to-tempfile-then-execute pattern: `INSTALL_SCRIPT=$(mktemp)` followed by `curl -fsSL ... -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" -- "$CLAUDE_CODE_VERSION"`. Tempfile is cleaned up after use.

### Iteration 2

**Fixes applied:** unpinned-uses, permissions, script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 5 findings across 8 workflow files:

1. unpinned-uses: Pinned all action references to full commit SHAs in ci.yml, claude.yml, claude-review.yml, issue-triage.yml, and release.yml. Used lookup_action_sha to get real SHAs for actions/checkout@v6 (d23441a4...), oven-sh/setup-bun@v2 (0c5077e5...), oven-sh/setup-bun@v1 (f4d14e03...), and anthropics/claude-code-action@main/v1 (44423bde...).

2. permissions: Added top-level `permissions: contents: read` to ci.yml.

3. script-injection: Moved all ${{ }} expressions from run: shell blocks to env: blocks in release.yml, sync-base-action.yml, test-base-action.yml, test-settings.yml, test-custom-executables.yml, and test-structured-output.yml. The Summary step in test-structured-output.yml was rewritten to use shell conditionals instead of ${{ }} ternary expressions.

4. github-env-injection: In release.yml's 'Calculate next version' step, sanitized next_version with `printf '%s' "$next_version" | tr -d '\n\r'` before writing to $GITHUB_OUTPUT. Also moved LATEST_TAG input to env block.

5. unsafe-shell: In test-custom-executables.yml, replaced both `curl | bash` patterns with download-then-execute: curl downloads to /tmp/*.sh file, then bash executes the file separately.

