<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.197

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.197** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is directly interpolated inside a run: shell command string. The step runs: `python "${{ github.action_path }}/agent_approval_check.py"` — the expression `${{ github.action_path }}` is substituted by the Actions runner before the shell sees the command, meaning any unexpected characters in the path could affect shell parsing. All ${{ ... }} expressions must be moved to an env: block and referenced as shell variables instead.

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Moved `${{ github.action_path }}` from the `run:` command string into the step's `env:` block as `ACTION_PATH`. The shell command now uses `"$ACTION_PATH/agent_approval_check.py"` instead of `"${{ github.action_path }}/agent_approval_check.py"`, eliminating the direct expression interpolation in the shell string.

