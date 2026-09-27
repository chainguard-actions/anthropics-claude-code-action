<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.209

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.209** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a) violation: The run: block on line 59 of action.yml directly interpolates the GitHub Actions expression `${{ github.action_path }}` inside the shell command string: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression interpolated directly into a run: script is a script-injection risk because YAML template substitution occurs before the shell ever sees the value. The safe fix is to use the pre-set environment variable `$GITHUB_ACTION_PATH` instead: `run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `action.yml:59`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed script injection in action.yml line 59: replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. The `$GITHUB_ACTION_PATH` environment variable is pre-set by the GitHub Actions runner and is equivalent to `github.action_path`, so this is a safe, functionally identical replacement that eliminates the YAML template substitution before shell execution.

