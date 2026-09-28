<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.181

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.181** was hardened automatically. 2 finding(s) were identified and resolved across 3 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): The 'Revoke app token' step in action.yml directly interpolates a `${{ steps.run.outputs.github_token }}` expression inside the `run:` shell command string: `-H "Authorization: Bearer ${{ steps.run.outputs.github_token }}"`. Any `${{ ... }}` expression interpolated directly into a shell command is a script injection risk — the value is substituted by the Actions template engine before the shell ever sees it, bypassing all shell quoting. The token value should be passed via an `env:` variable and referenced as `$ENV_VAR` in the shell command instead.

Locations:

- `action.yml:399`

### unsafe-shell (severity: high)

The 'Install Claude Code' step in base-action/action.yml pipes remote content directly to bash without first downloading and verifying it: `curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION`. This pattern executes whatever the remote server returns, making the action vulnerable to supply-chain attacks if the remote URL is compromised. The install script should be downloaded to a file first, its integrity verified (e.g., via checksum), and then executed separately.

Locations:

- `base-action/action.yml:148`
- `base-action/action.yml:150`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unsafe-shell

**Notes:**

1. script-injection (action.yml line 399): Moved `${{ steps.run.outputs.github_token }}` out of the 'Revoke app token' run: shell command into an env: block as APP_TOKEN, then referenced it as $APP_TOKEN in the curl Authorization header.
2. unsafe-shell (base-action/action.yml lines 148/150): Replaced both pipe-to-bash forms (`curl ... | bash -s -- $VERSION`) with a download-then-execute pattern: curl downloads to a mktemp file, then bash executes the file with the version as a positional argument. The '--' was dropped per instructions (it was the shell's option terminator in the pipe form, not the script's own argument). Cleanup of the temp file is done after the retry loop.

### Iteration 2

**Fixes applied:** script-injection, github-env-injection

**Notes:**

Three fixes applied across two finding types:
1. agent-approval-check/action.yml (line 48): Moved `${{ github.action_path }}` from the `run:` shell command into the step's `env:` block as `ACTION_PATH`, then referenced it as `$ACTION_PATH` in the shell script to eliminate the script-injection finding.
2. action.yml (line 153): Added `safe_bun_dir=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` before writing to `$GITHUB_PATH` to sanitize the attacker-controlled `path_to_bun_executable` input and prevent newline injection.
3. base-action/action.yml (line 110): Applied the identical sanitization fix as #2 to the same vulnerable pattern in the base action.

### Iteration 3

**Fixes applied:** github-env-injection

**Notes:**

In base-action/action.yml, the 'Install Claude Code' step's else branch (which handles a custom executable path) now sanitizes CLAUDE_DIR before writing to $GITHUB_PATH. Added `safe_claude_dir=$(printf '%s' "$CLAUDE_DIR" | tr -d '\n\r')` and changed the echo to use `$safe_claude_dir` instead of `$CLAUDE_DIR`, matching the pattern already used in the 'Setup Custom Bun Path' step for BUN_DIR.

