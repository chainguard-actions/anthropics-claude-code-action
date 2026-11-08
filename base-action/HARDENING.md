<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.269

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.269** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' runs BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE"), which takes its value from inputs.path_to_bun_executable. It then writes the result to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"` without first applying `printf '%s' ... | tr -d '\n\r'`. If the value contains newlines, the action adds extra entries to PATH.

Locations:

- `action.yml:135`

### github-env-injection (severity: high)

Step 'Install Claude Code' runs CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"), which takes its value from inputs.path_to_claude_code_executable. It then writes the result to $GITHUB_PATH with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without first applying `printf '%s' ... | tr -d '\n\r'`.

Locations:

- `action.yml:173`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:155`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell in its fallback branch: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:157`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

Both steps that wrote a directory to GITHUB_PATH now strip newlines first: 'Setup Custom Bun Path' (BUN_DIR) and 'Install Claude Code' (CLAUDE_DIR). They use printf '%s' | tr -d '\n\r' before the write. The 'Install Claude Code' step no longer pipes https://claude.ai/install.sh into bash. It saves the script to a mktemp file and then runs bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION", with '-s --' dropped so the script gets the version as $1. Both the timeout branch and the fallback branch work this way, and the 3-attempt retry loop is unchanged. In the timeout branch, the 120-second timeout now applies to the download and the install separately, so the worst case is about 240 seconds instead of 120. The edits were not run or tested.

