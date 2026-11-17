<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.279

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.279** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' builds BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") from inputs.path_to_bun_executable and writes it to $GITHUB_PATH (echo "$BUN_DIR" >> "$GITHUB_PATH") without first running it through printf '%s' ... | tr -d '\n\r'. A value with a newline in it adds extra PATH entries chosen by whoever sets the input.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' builds CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") from inputs.path_to_claude_code_executable and writes it to $GITHUB_PATH (echo "$CLAUDE_DIR" >> "$GITHUB_PATH") without first running it through printf '%s' ... | tr -d '\n\r'.

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

Remote script piped straight into a shell: timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION" in the 'Install Claude Code' step.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Remote script piped straight into a shell: curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION" in the 'Install Claude Code' step (fallback when timeout is not available).

Locations:

- `action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

I fixed both findings in action.yml. Nothing was run here, so none of this has been tested.

1. github-env-injection: before BUN_DIR and CLAUDE_DIR are written to $GITHUB_PATH, they now pass through printf '%s' | tr -d '\n\r'. A newline in either input can no longer add extra PATH entries.

2. unsafe-shell: the Claude Code installer is no longer piped into bash. Each retry attempt now:
   - downloads install.sh to a temp file made with mktemp;
   - checks that the file is not empty;
   - runs it as bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION", with the '-s --' dropped so the script still gets the version as $1;
   - deletes the temp file whether the attempt succeeds or fails.

The retry loop works as before. When the timeout command exists, the download and the install now have separate timeouts (60s and 120s, both with --foreground --kill-after=10). Upstream had a single 120s limit covering both.

