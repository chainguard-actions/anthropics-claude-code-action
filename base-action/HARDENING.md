<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.271

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.271** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") to $GITHUB_PATH. PATH_TO_BUN_EXECUTABLE comes from inputs.path_to_bun_executable, and the value is not passed through printf '%s' ... | tr -d '\n\r' first. dirname keeps embedded newlines, so a multi-line input can add extra PATH entries.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' writes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") to $GITHUB_PATH with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`. PATH_TO_CLAUDE_CODE_EXECUTABLE comes from inputs.path_to_claude_code_executable, and newlines are not stripped before the write.

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes a remote script straight into a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

I fixed all four findings, all in action.yml. I only edited the file and did not run the action, so none of this is tested yet.

- **Path writes (github-env-injection):** the custom Bun and Claude Code paths are now cleaned before they go into $GITHUB_PATH. The step first saves the `dirname` result, then removes newlines with `printf '%s' | tr -d '\n\r'`. Because of that first step, a failing `dirname` still stops the step instead of being hidden.
- **Installer download (unsafe-shell):** the step now downloads the claude.ai install script to a temp file and then runs `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. I dropped the `-s --` so the version arrives as the script's first argument.

The install still retries three times. One behaviour change: the download and the run now each get their own 120-second timeout, where before one 120-second timeout covered both, so a slow attempt can now take up to about twice as long before it gives up.

