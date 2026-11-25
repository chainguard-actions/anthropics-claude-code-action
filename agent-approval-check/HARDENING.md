<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.290

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.290** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a), direct expression interpolation: a GitHub Actions expression is placed straight into a run: shell command. Offending line: `- run: python "${{ github.action_path }}/agent_approval_check.py"`. Fix: use the shell variable the runner already sets, `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`, or pass the value through an env: entry and use it double-quoted.

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced inline ${{ github.action_path }} in run: with the runner-provided $GITHUB_ACTION_PATH (bash shell, double-quoted).

