<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.283

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.283** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' builds BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") from inputs.path_to_bun_executable and writes it with echo "$BUN_DIR" >> "$GITHUB_PATH". Newlines are not stripped first (no printf '%s' ... | tr -d '\n\r'). An input containing a newline adds attacker-chosen directories to PATH.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' builds CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") from inputs.path_to_claude_code_executable and writes it with echo "$CLAUDE_DIR" >> "$GITHUB_PATH". Newlines are not stripped first (no printf '%s' ... | tr -d '\n\r'). An input containing a newline adds attacker-chosen directories to PATH.

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION". The script should be downloaded to a file, checked, and then run as a separate command.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' (fallback branch) pipes a remote script straight into a shell: curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION". The script should be downloaded to a file, checked, and then run as a separate command.

Locations:

- `action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

I fixed all four findings in action.yml. Nothing has been run yet.

- **unsafe-shell (both the main branch and the fallback branch):** The installer is now saved to a temporary file and only run if the download is not empty. It runs as `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. The `-s --` from the old piped form was dropped, so the installer gets the version as its first argument, as it did before. The download step now has its own 120-second limit (`curl --max-time 120`). The 120-second `timeout` around the install itself still applies. The temporary file is deleted after every attempt.
- **github-env-injection (Bun path and Claude Code path):** The folder taken from `path_to_bun_executable` or `path_to_claude_code_executable` now has newlines removed with `printf '%s' ... | tr -d '\n\r'` before it is added to `$GITHUB_PATH`.

The installer is still run whenever it downloads and is not empty. The script itself is not checked against a hash or signature.

