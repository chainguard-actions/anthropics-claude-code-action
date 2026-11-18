<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.282

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.282** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' (action.yml) writes a value taken from untrusted input to $GITHUB_PATH without sanitizing it first. `inputs.path_to_bun_executable` is passed in through env var PATH_TO_BUN_EXECUTABLE. The script then runs `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and `echo "$BUN_DIR" >> "$GITHUB_PATH"`. If the input contains a newline, every extra line becomes its own PATH entry. The value also never goes through `printf '%s' ... | tr -d '\n\r'` before the write. $GITHUB_PATH has no heredoc form, so the newline strip is required. Fix: `safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r'); echo "$safe" >> "$GITHUB_PATH"`.

Locations:

- `action.yml:225`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection

**Notes:**

In action.yml, the 'Setup Custom Bun Path' step now removes newlines and carriage returns from BUN_DIR (printf '%s' | tr -d '\n\r') before writing it to $GITHUB_PATH. base-action/action.yml had the same issue, and its fix is outside the request, which listed only action.yml. There I applied the same change to its 'Setup Custom Bun Path' step and to the custom Claude Code path written to $GITHUB_PATH. Nothing else changed. I haven't run the action or a new analysis pass to confirm the finding is gone.

