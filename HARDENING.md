<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.287

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.287** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

In the composite step 'Setup Custom Bun Path' in action.yml, the value of `inputs.path_to_bun_executable` is passed through the env var PATH_TO_BUN_EXECUTABLE. The script runs `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")` and then writes it with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. Newlines are not stripped first. `dirname` keeps embedded newlines, so an input containing newlines would add extra attacker-chosen entries to PATH. Fix: apply `printf '%s' "$BUN_DIR" | tr -d '\n\r'` right before the write.

Locations:

- `action.yml:224`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection

**Notes:**

In the 'Setup Custom Bun Path' step, BUN_DIR now has newlines and carriage returns stripped (printf '%s' "$BUN_DIR" | tr -d '\n\r') before it is written to $GITHUB_PATH. I made this change in action.yml, which the finding named, and also in base-action/action.yml, which has the same code. The dirname call is still assigned on its own line, so if it fails the step still stops. No tests were run.

