<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.289

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.289** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") to $GITHUB_PATH. The value comes from inputs.path_to_bun_executable and is written with `echo "$BUN_DIR" >> "$GITHUB_PATH"` without first running printf '%s' ... | tr -d '\n\r'. dirname keeps embedded newlines, so a multi-line input can add any directory to PATH.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' writes CLAUDE_DIR=$(dirname "$PATH_TO_CLAUDE_CODE_EXECUTABLE") to $GITHUB_PATH. The value comes from inputs.path_to_claude_code_executable and is written with `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"` without the newline-stripping step (printf '%s' ... | tr -d '\n\r').

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes remote content straight into a shell: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes remote content straight into a shell in the fallback path: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

I fixed all four findings in action.yml. Nothing has been run or tested.

- **github-env-injection (two places):** In the 'Setup Custom Bun Path' and 'Install Claude Code' steps, newlines are now removed from the folder name before it is added to $GITHUB_PATH, using printf '%s' ... | tr -d '\n\r'. A path input with several lines can no longer add extra folders to PATH.
- **unsafe-shell (main and fallback install paths):** Each install attempt now downloads https://claude.ai/install.sh to a temporary file made with mktemp. It checks the download succeeded and the file is not empty, then runs it with `bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION"`. I dropped the `-s --` from the old pipe form so the installer still gets the version as its first argument. The 3-attempt retry and the 120s timeout (`--foreground --kill-after=10`) are unchanged, and the temporary file is deleted after a successful install.

One behaviour change: the download now has its own 120-second limit (`curl --max-time 120`), separate from the installer's. Before, a single 120-second timeout covered the download and the install together, so one attempt can now take up to about twice as long.

