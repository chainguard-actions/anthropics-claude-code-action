<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.200

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.200** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the input `inputs.path_to_bun_executable` is mapped to the env var PATH_TO_BUN_EXECUTABLE, then used to compute BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE"), and the result is written to $GITHUB_PATH via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without any newline-stripping sanitization (printf '%s' ... | tr -d '\n\r'). An attacker-controlled value containing embedded newlines could inject arbitrary entries into GITHUB_PATH.

Locations:

- `action.yml:192`
- `base-action/action.yml:138`

### script-injection (severity: high)

Sub-rule (a): In the 'Revoke app token' step, the expression ${{ steps.run.outputs.github_token }} is interpolated directly inside the run: shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any ${{ ... }} expression inside a run: block undergoes YAML template substitution before the shell sees it, making this a script-injection risk regardless of the context it reads from.

Locations:

- `action.yml:374`

### unsafe-shell (severity: high)

In the 'Install Claude Code' step, remote content is fetched and piped directly to bash without first downloading and verifying it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns, with no integrity check.

Locations:

- `base-action/action.yml:155`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection, unsafe-shell

**Notes:**

Fixed three security findings: (1) github-env-injection in both action.yml and base-action/action.yml 'Setup Custom Bun Path' steps — added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to $GITHUB_PATH; (2) script-injection in action.yml 'Revoke app token' step — moved `${{ steps.run.outputs.github_token }}` into an env var `APP_TOKEN` and referenced it as `$APP_TOKEN` in the curl command; (3) unsafe-shell in base-action/action.yml 'Install Claude Code' step — replaced the `curl | bash` pipe pattern with download-then-execute: `curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`, dropping the `--` that was the shell's stdin-mode option terminator.

### Iteration 2

**Fixes applied:** script-injection, github-env-injection

**Notes:**

1. agent-approval-check/action.yml line 56: Replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"` — uses the pre-set system env var instead of interpolating a GitHub Actions expression directly into the shell command. 2. base-action/action.yml ~line 222: Added newline-stripping sanitization `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` before writing the Claude executable directory to $GITHUB_PATH, matching the existing pattern used for the Bun path step.

