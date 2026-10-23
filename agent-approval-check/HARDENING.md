<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.260

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.260** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a): a GitHub Actions expression is placed directly inside a run: command. Offending line: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Fix: use the runner-provided env var instead: `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`.

Locations:

- `action.yml:60`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

In action.yml, replaced the inline ${{ github.action_path }} expression with the runner-provided "$GITHUB_ACTION_PATH" in the bash run step that starts agent_approval_check.py. The step uses shell: bash, so the $VAR syntax works.

