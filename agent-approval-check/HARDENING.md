<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.282

> This file was generated automatically by the hardening agent.

**Policy SHA:** `374911c4be584df24e6da57af2d990570ef0f859`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.282** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a) violated: a GitHub Actions expression is put straight into a composite step's run: block: `run: python "${{ github.action_path }}/agent_approval_check.py"`. The value is substituted into the script text before the shell parses it. Fix: pass the path through an env var (e.g. ACTION_PATH: ${{ github.action_path }}) and call it as python "$ACTION_PATH/agent_approval_check.py", or use the runner-provided "$GITHUB_ACTION_PATH".

Locations:

- `action.yml:60`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Moved github.action_path into the step env as ACTION_PATH and invoked python "$ACTION_PATH/agent_approval_check.py" (bash shell).

