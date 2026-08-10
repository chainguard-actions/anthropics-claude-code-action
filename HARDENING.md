<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.176

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.176** was hardened automatically. 6 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A GitHub Actions expression is directly interpolated inside a run: shell command. In action.yml's 'Revoke app token' step, `${{ steps.run.outputs.github_token }}` is embedded directly in a curl command's Authorization header string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. This allows the value to be injected into the shell command before the shell ever sees it. The value should be passed via an env: variable and referenced as `$ENV_VAR` instead.

Locations:

- `action.yml:449`

### script-injection (severity: high)

Sub-rule (a): A GitHub Actions expression is directly interpolated inside a run: shell command. In agent-approval-check/action.yml, `${{ github.action_path }}` is embedded directly in the run: command: `python "${{ github.action_path }}/agent_approval_check.py"`. Any ${{ ... }} expression inside a run: block is a script-injection risk as the value is substituted by the template engine before the shell parses it. The path should be passed via an env: variable instead.

Locations:

- `agent-approval-check/action.yml:48`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in action.yml writes $BUN_DIR (derived from the env var PATH_TO_BUN_EXECUTABLE, which is set from inputs.path_to_bun_executable) to $GITHUB_PATH without sanitization. An attacker-controlled input value containing newlines could inject additional entries into GITHUB_PATH. The value should be sanitized with `printf '%s' "$BUN_DIR" | tr -d '\n\r'` before writing to $GITHUB_PATH.

Locations:

- `action.yml:213`

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in base-action/action.yml writes $BUN_DIR (derived from the env var PATH_TO_BUN_EXECUTABLE, which is set from inputs.path_to_bun_executable) to $GITHUB_PATH without sanitization. An attacker-controlled input value containing newlines could inject additional entries into GITHUB_PATH. The value should be sanitized with `printf '%s' "$BUN_DIR" | tr -d '\n\r'` before writing to $GITHUB_PATH.

Locations:

- `base-action/action.yml:143`

### github-env-injection (severity: high)

The 'Install Claude Code' step in base-action/action.yml writes $CLAUDE_DIR (derived from the env var PATH_TO_CLAUDE_CODE_EXECUTABLE, which is set from inputs.path_to_claude_code_executable) to $GITHUB_PATH without sanitization. An attacker-controlled input value containing newlines could inject additional entries into GITHUB_PATH. The value should be sanitized with `printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'` before writing to $GITHUB_PATH.

Locations:

- `base-action/action.yml:175`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash in two places: (1) `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"` and (2) `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. Piping a remotely fetched script directly to bash means any compromise of the remote server or a MITM attack could execute arbitrary code. The script should be downloaded to a file first, its integrity verified (e.g., via checksum), and then executed separately.

Locations:

- `base-action/action.yml:163`
- `base-action/action.yml:165`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 6 findings across 3 files:

1. action.yml (line 449) - script-injection: Moved `${{ steps.run.outputs.github_token }}` to env var `APP_TOKEN` in the 'Revoke app token' step's env: block; referenced as `$APP_TOKEN` in the curl Authorization header.

2. action.yml (line 213) - github-env-injection: Sanitized BUN_DIR before writing to $GITHUB_PATH using `printf '%s' "$BUN_DIR" | tr -d '\n\r'` in the 'Setup Custom Bun Path' step.

3. agent-approval-check/action.yml (line 48) - script-injection: Moved `${{ github.action_path }}` to env var `ACTION_PATH`; referenced as `$ACTION_PATH` in the python command.

4. base-action/action.yml (line 143) - github-env-injection: Sanitized BUN_DIR before writing to $GITHUB_PATH using `printf '%s' "$BUN_DIR" | tr -d '\n\r'` in the 'Setup Custom Bun Path' step.

5. base-action/action.yml (lines 163, 165) - unsafe-shell: Replaced both `curl ... | bash -s -- $VERSION` pipe patterns with download-then-execute: `curl -fsSL ... -o "$INSTALL_SCRIPT"` then `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. Dropped `-s` and `--` since the script is no longer piped to stdin.

6. base-action/action.yml (line 175) - github-env-injection: Sanitized CLAUDE_DIR before writing to $GITHUB_PATH using `printf '%s' "$CLAUDE_DIR" | tr -d '\n\r'` in the 'Install Claude Code' step.

### Iteration 2

**Fixes applied:** unpinned-uses, missing-permissions, script-injection, github-env-injection, unsafe-shell

**Notes:**

Fixed all 5 findings across 8 workflow files:

1. **unpinned-uses**: Pinned all action references to full SHAs:
   - actions/checkout@v6 → @d23441a48e516b6c34aea4fa41551a30e30af803 # v6
   - oven-sh/setup-bun@v2 → @0c5077e51419868618aeaa5fe8019c62421857d6 # v2
   - oven-sh/setup-bun@v1 → @f4d14e03ff726c06358e5557344e1da148b56cf7 # v1
   - anthropics/claude-code-action@main → @6b082c41935b4c8a3b8b0ef85ba4ba4d9eeb8975 # main
   - anthropics/claude-code-action@v1 → @6b082c41935b4c8a3b8b0ef85ba4ba4d9eeb8975 # v1

2. **missing-permissions**: Added `permissions: contents: read` to ci.yml.

3. **script-injection**: Moved all ${{ steps.*.outputs.* }}, ${{ needs.*.result }}, and ${{ github.sha }} expressions from run: blocks to env: blocks in release.yml, sync-base-action.yml, test-base-action.yml, test-custom-executables.yml, test-settings.yml, and test-structured-output.yml.

4. **github-env-injection**: In release.yml, sanitized tag values with `printf '%s' | tr -d '\n\r'` before writing to GITHUB_OUTPUT.

5. **unsafe-shell**: In test-custom-executables.yml, replaced `curl -fsSL https://bun.sh/install | bash` and `curl -fsSL https://claude.ai/install.sh | bash -s latest` with download-then-execute patterns using mktemp. Correctly dropped the `-s` and `--` from the claude.ai install command.

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed the 'Create test prompt file' step in .github/workflows/test-base-action.yml. Replaced the unquoted heredoc (`cat > test-prompt.txt << EOF` / `${PROMPT}` / `EOF`) with `printf '%s\n' "$PROMPT" > test-prompt.txt`. The printf approach safely writes the PROMPT variable's content to the file without shell expansion of the value, eliminating the command injection risk from the attacker-controllable workflow_dispatch input.

