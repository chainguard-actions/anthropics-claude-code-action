<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.274

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.274** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

In action.yml, the step 'Setup Custom Bun Path' writes a value built from inputs.path_to_bun_executable to $GITHUB_PATH without stripping newlines first. The input goes into env PATH_TO_BUN_EXECUTABLE, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE"), then `echo "$BUN_DIR" >> "$GITHUB_PATH"`. If the value contains newlines, extra PATH entries get injected. Fix: run `safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` and write "$safe" instead.

Locations:

- `action.yml:221`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection

**Notes:**

In the action.yml step 'Setup Custom Bun Path', BUN_DIR now has newlines and carriage returns removed with tr -d '\n\r' before it is written to $GITHUB_PATH. Nothing else changed.

