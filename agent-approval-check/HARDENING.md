<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.279

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.279** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a), direct expression interpolation: the run: block `run: python "${{ github.action_path }}/agent_approval_check.py"` puts a ${{ }} expression straight into the shell command. Use the runner-provided env var instead: `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

In action.yml, the run step now calls python "$GITHUB_ACTION_PATH/agent_approval_check.py" instead of putting the ${{ github.action_path }} expression straight into the shell command. GITHUB_ACTION_PATH is set by the runner and points to the same directory, and the step uses bash, so the script path and its behaviour are unchanged. I haven't run the action to test the change.

