<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--base-action/v1.0.286

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--base-action/v1.0.286** was hardened automatically. 4 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes BUN_DIR, which is dirname of the workflow-controlled input path_to_bun_executable (passed through env PATH_TO_BUN_EXECUTABLE), to $GITHUB_PATH without the `printf '%s' ... | tr -d '\n\r'` sanitization: `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A value containing newlines would add extra PATH entries.

Locations:

- `action.yml:136`

### github-env-injection (severity: high)

Step 'Install Claude Code' writes CLAUDE_DIR, which is dirname of the workflow-controlled input path_to_claude_code_executable (passed through env PATH_TO_CLAUDE_CODE_EXECUTABLE), to $GITHUB_PATH without newline sanitization: `echo "$CLAUDE_DIR" >> "$GITHUB_PATH"`.

Locations:

- `action.yml:174`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes remote content straight into a shell: `timeout ... bash -c "curl -fsSL https://claude.ai/install.sh | bash -s -- $CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:156`

### unsafe-shell (severity: high)

Step 'Install Claude Code' pipes remote content straight into a shell: `curl -fsSL https://claude.ai/install.sh | bash -s -- "$CLAUDE_CODE_VERSION"`.

Locations:

- `action.yml:158`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection, unsafe-shell

**Notes:**

I fixed all four findings in action.yml. I haven't run the action, so the new install path hasn't been tested.

- **Writes to GITHUB_PATH:** before BUN_DIR and CLAUDE_DIR are written, newlines are now removed with printf '%s' | tr -d '\n\r'. A path containing a line break can no longer add extra PATH entries.
- **Claude Code install:** I removed both places where curl piped https://claude.ai/install.sh straight into bash. Each retry now downloads the script to a mktemp file, checks the file isn't empty, and runs it as bash "$INSTALL_SCRIPT" "$CLAUDE_CODE_VERSION". I dropped the '-s --' that came with the pipe, so the version still arrives as the script's first argument. The temp file is deleted after every attempt.
- **Timeouts (behaviour change):** I kept the existing timeout wrapper, but split it in two: up to 60s for the download and up to 120s for running the installer. Before, a single 120s limit covered both, so an attempt can now take up to 180s.
- **Not changed:** the 3-attempt retry loop and the fallback for runners without timeout work as before.

### Iteration 2

**Fixes applied:** github-env-injection

**Notes:**

Fixed the finding in the 'Install Claude Code' step of action.yml. The line that wrote "$HOME/.local/bin" to $GITHUB_PATH now strips newlines and carriage returns first, using printf '%s\n' "$(printf '%s' "$HOME/.local/bin" | tr -d '\n\r')". This matches how the BUN_DIR and CLAUDE_DIR writes in the same file already work. Nothing else was changed, and the action has not been run since the edit.

