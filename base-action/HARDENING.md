<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.290

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.290** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes a value from untrusted input to $GITHUB_PATH with no newline strip. The input inputs.path_to_bun_executable goes into env PATH_TO_BUN_EXECUTABLE, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") and echo "$BUN_DIR" >> "$GITHUB_PATH". There is no printf '%s' ... | tr -d '\n\r' step. A value containing newlines can add arbitrary PATH entries.

Locations:

- `action.yml:127`

### github-env-injection (severity: high)

Step 'Install Claude Code' writes a value from untrusted input to $GITHUB_PATH with no newline strip. The input inputs.path_to_claude_code_executable goes into env PATH_TO_CLAUDE_CODE_EXECUTABLE, then CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") and echo "$CLAUDE_DIR" >> "$GITHUB_PATH". There is no printf '%s' ... | tr -d '\n\r' step.

Locations:

- `action.yml:165`

### unsafe-shell (severity: high)

Remote script piped straight to a shell: timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION" (step 'Install Claude Code').

Locations:

- `action.yml:147`

### unsafe-shell (severity: high)

Remote script piped straight to a shell: curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION" (step 'Install Claude Code', the branch used when timeout is not available).

Locations:

- `action.yml:149`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

I fixed all four findings in action.yml. Nothing has been run or tested yet.

- **github-env-injection (2):** The 'Setup Custom Bun Path' and 'Install Claude Code' steps now remove newlines and carriage returns from the dirname value before writing it to $GITHUB_PATH, using printf '%s' | tr -d '\n\r'.
- **unsafe-shell (2):** Each install attempt now downloads https://claude.ai/install.sh to a mktemp file, checks the file isn't empty, and runs it with: bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION". I dropped the '-s --' from the old piped form so the version reaches the script as $1. The temp file is deleted after each attempt.

The retry loop works as before, with one small timing change. The old code put a single 120-second timeout around download and install together. Now the download has its own 60-second timeout and the install keeps 120 seconds, so one attempt can take up to about 3 minutes plus the kill grace periods. The fallback for runners without the timeout command is still there.

