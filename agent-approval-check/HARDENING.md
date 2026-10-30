<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.265

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.265** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a), direct expression interpolation: a run: block puts a GitHub Actions expression straight into the shell command: `run: python "${{ github.action_path }}/agent_approval_check.py"`. The value is pasted in before the shell parses the line. Fix: use the runner-provided $GITHUB_ACTION_PATH variable instead, e.g. `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`, or pass the value through env:.

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

In action.yml, I replaced `${{ github.action_path }}` in the run step with "$GITHUB_ACTION_PATH" (bash shell, double-quoted). The runner sets this variable for composite actions, so the script still runs from the same path. The other values were already passed in through the step's env: block, so nothing else needed changing. I didn't run the action after the edit.

