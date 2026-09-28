<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a) violation: A `${{ ... }}` GitHub Actions expression is directly interpolated inside a `run:` shell command string. On line 57 of action.yml, the command `python "${{ github.action_path }}/agent_approval_check.py"` embeds `${{ github.action_path }}` directly in the shell string. Any `${{ ... }}` expression inside a `run:` block is a script-injection risk because YAML template substitution occurs before the shell ever sees the value. The safe fix is to use the pre-set environment variable `$GITHUB_ACTION_PATH` instead: `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection on line 57 of action.yml: replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. GitHub Actions automatically sets the `GITHUB_ACTION_PATH` environment variable to the same value as `github.action_path`, so this is a safe, equivalent substitution that eliminates the YAML template injection risk.

