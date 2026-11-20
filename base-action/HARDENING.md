<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.284

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.284** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE"), which comes from inputs.path_to_bun_executable, to $GITHUB_PATH with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. It does not first strip newlines with printf '%s' ... | tr -d '\n\r', so a value containing newlines can add extra PATH entries.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' writes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE"), which comes from inputs.path_to_claude_code_executable, to $GITHUB_PATH with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. It does not first strip newlines with printf '%s' ... | tr -d '\n\r'.

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' (the fallback branch) pipes a remote script straight into a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

All four findings are fixed in action.yml.

1. github-env-injection, 'Setup Custom Bun Path' step: the directory name is now passed through printf '%s' | tr -d '\n\r' to strip newlines before it is written to $GITHUB_PATH.
2. github-env-injection, 'Install Claude Code' custom-path branch: same fix for the directory written to $GITHUB_PATH.
3. unsafe-shell (both the timeout and fallback branches): the claude.ai/install.sh script is no longer piped into a shell. Each attempt now downloads it to a temp file made by mktemp, checks the file isn't empty, and runs it with bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION". I dropped the '-s --' so the script still gets the version as $1. The timeout path keeps its 120s limit, now applied separately to the download and to the run. The 3-attempt retry loop is unchanged, and the temp file is deleted after each attempt.

I haven't run the action to test these edits.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

In action.yml, the 'Install Claude Code' step now removes newline and carriage-return characters from "$HOME/.local/bin" before adding it to $GITHUB_PATH. It uses the same printf | tr -d '\n\r' pattern the step's custom-path branch already uses. Nothing else was changed, and I haven't run the action to test the edit.

