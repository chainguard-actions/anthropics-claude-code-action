<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.219

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.219** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A `${{ }}` expression is directly interpolated inside a `run:` shell command string. The line `run: python "${{ github.action_path }}/agent_approval_check.py"` embeds `${{ github.action_path }}` directly in the shell command. Per the check rules, ANY `${{ ... }}` expression inside a `run:` block is a script-injection finding — the value is substituted by the Actions template engine before the shell ever sees it, bypassing shell quoting. The safe alternative is to use the `$GITHUB_ACTION_PATH` environment variable (which is automatically set by the runner) instead: `run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `action.yml:58`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced `${{ github.action_path }}` in the `run:` command with `$GITHUB_ACTION_PATH` (the equivalent runner-provided environment variable). This eliminates the template-engine substitution that caused the script-injection finding, while preserving identical runtime behavior since GitHub Actions automatically sets GITHUB_ACTION_PATH to the same value.

