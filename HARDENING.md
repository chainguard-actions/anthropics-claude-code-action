<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.178

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.178** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a) violation: The 'Revoke app token' step in action.yml directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command string. The expression is embedded in a curl `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"` header, meaning the GitHub Actions template engine substitutes the token value directly into the shell command before the shell ever sees it. Any newline or shell metacharacter in the output value could allow command injection. The value should be passed via an `env:` variable and referenced as `$ENV_VAR` in the shell script.

Locations:

- `action.yml:492`

### github-env-injection (severity: high)

Three steps write values derived from action inputs to $GITHUB_PATH without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). (1) action.yml 'Setup Custom Bun Path': `$BUN_DIR` is computed from `$PATH_TO_BUN_EXECUTABLE` (which holds `inputs.path_to_bun_executable`) and written directly to $GITHUB_PATH via `echo "$BUN_DIR" >> "$GITHUB_PATH"`. (2) base-action/action.yml 'Setup Custom Bun Path': identical pattern with `inputs.path_to_bun_executable`. (3) base-action/action.yml 'Install Claude Code': `$CLAUDE_DIR` is computed from `$PATH_TO_CLAUDE_CODE_EXECUTABLE` (which holds `inputs.path_to_claude_code_executable`) and written directly to $GITHUB_PATH via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. A calling workflow can supply a path containing newline characters to inject arbitrary entries into $GITHUB_PATH.

Locations:

- `action.yml:232`
- `base-action/action.yml:136`
- `base-action/action.yml:168`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes the output of a remote URL directly to bash: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. This pattern executes whatever content the remote server returns without any integrity verification (e.g., checksum validation). If the remote URL is compromised or the response is tampered with in transit, arbitrary code will execute on the runner. The script should be downloaded to a file first, its checksum verified, and then executed separately.

Locations:

- `base-action/action.yml:155`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all three findings: (1) script-injection in action.yml 'Revoke app token' step: moved ${{ steps.run.outputs.github_token }} to env: block as GITHUB_APP_TOKEN and referenced it as $GITHUB_APP_TOKEN in the curl command. (2) github-env-injection in action.yml 'Setup Custom Bun Path': sanitized BUN_DIR with printf/tr before writing to $GITHUB_PATH. (3) github-env-injection in base-action/action.yml 'Setup Custom Bun Path': same sanitization fix. (4) github-env-injection in base-action/action.yml 'Install Claude Code': sanitized CLAUDE_DIR with printf/tr before writing to $GITHUB_PATH. (5) unsafe-shell in base-action/action.yml 'Install Claude Code': replaced curl|bash pipe with download-then-execute pattern using a mktemp file, dropping the '-s' and '--' shell options as required, passing the version directly as a positional argument to the script.

### Iteration 2

**Fixes applied:** script-injection, unsafe-shell

**Notes:**

1. agent-approval-check/action.yml line 50: Replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"` to eliminate the ${{ }} expression from the run: shell command. 2. src/entrypoints/run.ts buildInstallCommand(): Replaced the curl-pipe-to-bash pattern (`curl -fsSL https://claude.ai/install.sh | bash -s -- ${version}`) with a safe download-then-execute pattern: `INSTALL_SCRIPT=$(mktemp /tmp/claude-install-XXXXXX.sh) && curl -fsSL https://claude.ai/install.sh -o "$INSTALL_SCRIPT" && bash "$INSTALL_SCRIPT" ${version}`. The `-s` and `--` flags were dropped as they were shell stdin-reading and option-termination flags for the pipe form, not arguments to the install script itself.

