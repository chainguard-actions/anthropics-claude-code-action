<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.275

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.275** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a), an expression placed directly in a run: block. The step `run: python "${{ github.action_path }}/agent_approval_check.py"` puts a GitHub Actions expression straight into the shell command. The runner substitutes it before the shell parses the line. Fix: use the shell variable $GITHUB_ACTION_PATH instead, e.g. `run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `action.yml:56`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced ${{ github.action_path }} in the run: step with the $GITHUB_ACTION_PATH runner env var (shell: bash), keeping it double-quoted.

