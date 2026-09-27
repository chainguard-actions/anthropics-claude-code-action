<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.69

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.69** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the env var PATH_TO_BUN_EXECUTABLE (sourced from inputs.path_to_bun_executable) is used to compute BUN_DIR and then written to $GITHUB_PATH via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A calling workflow can supply a newline-containing value to inject arbitrary entries into PATH.

Locations:

- `action.yml:175`

### github-env-injection (severity: high)

In the 'Setup Custom Bun Path' step, the env var PATH_TO_BUN_EXECUTABLE (sourced from inputs.path_to_bun_executable) is used to compute BUN_DIR and then written to $GITHUB_PATH via `echo "$BUN_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A calling workflow can supply a newline-containing value to inject arbitrary entries into PATH.

Locations:

- `base-action/action.yml:113`

### github-env-injection (severity: high)

In the 'Install Claude Code' step, the env var PATH_TO_CLAUDE_CODE_EXECUTABLE (sourced from inputs.path_to_claude_code_executable) is used to compute CLAUDE_DIR and then written to $GITHUB_PATH via `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the required sanitization step (`printf '%s' ... | tr -d '\n\r'`). A calling workflow can supply a newline-containing value to inject arbitrary entries into PATH.

Locations:

- `base-action/action.yml:148`

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step directly interpolates `${{ steps.run.outputs.github_token }}` inside a `run:` shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any expression interpolated directly in a run block is a script-injection risk because the value is substituted into the shell command before the shell parses it. This should be moved to an `env:` variable and referenced as `$ENV_VAR` in the shell.

Locations:

- `action.yml:275`

### unsafe-shell (severity: high)

The 'Install Claude Code' step pipes remote content directly to bash in two places: (1) inside a bash -c string: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION` and (2) directly: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`. The install script should be downloaded to a file first, its integrity verified, and then executed separately.

Locations:

- `base-action/action.yml:138`
- `base-action/action.yml:140`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, script-injection, unsafe-shell

**Notes:**

Fixed all 5 findings across action.yml and base-action/action.yml:
1. action.yml Setup Custom Bun Path: Sanitized BUN_DIR with `printf '%s' ... | tr -d '\n\r'` before writing to GITHUB_PATH.
2. base-action/action.yml Setup Custom Bun Path: Same BUN_DIR sanitization fix.
3. base-action/action.yml Install Claude Code (CLAUDE_DIR): Sanitized CLAUDE_DIR with `printf '%s' ... | tr -d '\n\r'` before writing to GITHUB_PATH.
4. action.yml Revoke app token: Moved `${{ steps.run.outputs.github_token }}` to an `env:` block as `APP_TOKEN` and referenced it as `$APP_TOKEN` in the shell script.
5. base-action/action.yml Install Claude Code (curl|bash): Replaced both pipe-to-bash patterns with download-to-tempfile-then-execute. The `--` was dropped (it was the shell's option terminator in the pipe form, not the script's argument). Temp file is cleaned up after installation.

