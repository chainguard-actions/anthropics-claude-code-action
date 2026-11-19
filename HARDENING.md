<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.283

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.283** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

The 'Setup Custom Bun Path' step writes a value taken from the untrusted input inputs.path_to_bun_executable to $GITHUB_PATH, with no newline stripping first. The input goes into env PATH_TO_BUN_EXECUTABLE, then BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE"), then `echo "$BUN_DIR" >> "$GITHUB_PATH"`. dirname does not remove newlines from the value, so a path containing a newline adds extra, attacker-chosen PATH entries. Fix: `safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r')` and then `echo "$safe" >> "$GITHUB_PATH"`.

Locations:

- `action.yml:225`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection

**Notes:**

In the 'Setup Custom Bun Path' step, the bun directory is now stripped of newlines before it is written to $GITHUB_PATH: safe=$(printf '%s' "$BUN_DIR" | tr -d '\n\r'), then echo "$safe" >> "$GITHUB_PATH". The finding named action.yml, but base-action/action.yml has the same step with the same problem, so I fixed it there too. Nothing was run to test the change.

