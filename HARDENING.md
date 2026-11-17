<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.279

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.279** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step in action.yml writes a value taken from untrusted input to $GITHUB_PATH without removing newlines first. PATH_TO_BUN_EXECUTABLE comes from `${{ inputs.path_to_bun_executable }}`. The script sets BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE") and then runs `echo "$BUN_DIR" >> "$GITHUB_PATH"`. If the input contains a newline, extra PATH entries get added. $GITHUB_PATH has no heredoc form, so the value must go through `printf '%s' "$BUN_DIR" | tr -d '\n\r'` before the write.

Locations:

- `action.yml:221`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection

**Notes:**

In action.yml, the 'Setup Custom Bun Path' step now strips newlines and carriage returns from BUN_DIR with printf '%s' | tr -d '\n\r' before it writes the directory to $GITHUB_PATH.

