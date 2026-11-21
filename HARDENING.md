<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action/v1.0.286

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action/v1.0.286** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### github-env-injection (severity: high)

Step 'Setup Custom Bun Path' (action.yml) builds BUN_DIR from the workflow-controlled input inputs.path_to_bun_executable (passed in through env PATH_TO_BUN_EXECUTABLE) using `BUN_DIR=$(dirname "$PATH_TO_BUN_EXECUTABLE")`, then writes it with `echo "$BUN_DIR" >> "$GITHUB_PATH"`. Nothing removes newlines first (no `printf '%s' ... | tr -d '\n\r'`). If the input contains a newline, it can add extra entries to PATH.

Locations:

- `action.yml:225`

## Iteration Notes

### Iteration 1

**Fixes applied:** github-env-injection

**Notes:**

The 'Setup Custom Bun Path' step in action.yml now strips newlines and carriage returns from BUN_DIR before writing it to $GITHUB_PATH. It does this with `printf '%s' | tr -d '\n\r'`, so an input containing a newline can no longer add extra PATH entries. The capture stays separate from the cleanup, so a failing dirname still stops the step as it did upstream. base-action/action.yml had the same pattern in two places, BUN_DIR and CLAUDE_DIR (taken from path_to_claude_code_executable), and I fixed both the same way. I haven't run the action to test these changes. Separately, base-action/action.yml still pipes https://claude.ai/install.sh straight into bash. That wasn't among the reported findings, so I left it as it is.

