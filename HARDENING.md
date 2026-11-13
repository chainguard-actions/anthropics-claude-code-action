<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.275

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.275** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' writes a value built from inputs.path_to_bun_executable to $GITHUB_PATH without stripping newlines first. The input goes into env PATH_TO_BUN_EXECUTABLE, then `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")`, then `echo "$BUN_DIR" >> "$GITHUB_PATH"`. A value containing newlines would add extra PATH entries the caller controls. Fix: run it through `printf '%s' "$BUN_DIR" | tr -d '\n\r'` right before the write.

Locations:

- `action.yml:220`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection

**Notes:**

In the 'Setup Custom Bun Path' step of action.yml, BUN_DIR now goes through printf '%s' | tr -d '\n\r' (stored as SAFE_BUN_DIR) before it is written to $GITHUB_PATH. Normal single-line paths behave exactly as before.

