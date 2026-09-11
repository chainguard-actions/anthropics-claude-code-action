<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.221

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.221** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A `${{ ... }}` expression is interpolated directly inside a `run:` shell command string. The step runs `python "${{ github.action_path }}/agent_approval_check.py"`, embedding `${{ github.action_path }}` directly in the shell command. Per the security rules, any `${{ ... }}` expression directly inside a `run:` block is a script-injection finding regardless of which context it reads from. The safe alternative is to use the pre-set environment variable `$GITHUB_ACTION_PATH` instead (e.g., `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`).

Offending line: `    - run: python "${{ github.action_path }}/agent_approval_check.py"`

Locations:

- `action.yml:56`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in hardened/action/action.yml line 56: replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. GitHub Actions pre-sets the `GITHUB_ACTION_PATH` environment variable to the same value as `github.action_path`, so the behavior is identical but the expression is no longer interpolated directly into the shell command string.

