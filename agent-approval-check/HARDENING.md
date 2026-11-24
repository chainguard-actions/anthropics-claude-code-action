<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.289

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.289** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a) is violated: a GitHub Actions expression is placed directly inside a run: block. The offending line is `run: python "${{ github.action_path }}/agent_approval_check.py"`. The expression is filled in before the shell runs, so it is not protected by shell quoting. Fix: use the GITHUB_ACTION_PATH env var instead, e.g. `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced inline ${{ github.action_path }} in run: with the runner-provided $GITHUB_ACTION_PATH env var (shell: bash), quoted.

