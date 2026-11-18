<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.280

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.280** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a) is violated: a GitHub Actions expression is placed directly inside a run: script in the composite action. Offending line: `run: python "${{ github.action_path }}/agent_approval_check.py"`. The value is substituted into the script text before the shell runs, so a path containing shell metacharacters could inject commands. Fix: use the runner-provided $GITHUB_ACTION_PATH variable instead, e.g. `run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"`, or pass the value in through an env: entry.

Locations:

- `action.yml:56`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced inline ${{ github.action_path }} in the run: step with the runner-provided $GITHUB_ACTION_PATH (bash shell), quoted.

