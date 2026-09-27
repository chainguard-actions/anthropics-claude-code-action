<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.168

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.168** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A `${{ ... }}` expression is directly interpolated inside a `run:` shell command string. Line 56 of action.yml contains:

    run: python "${{ github.action_path }}/agent_approval_check.py"

The `github.action_path` value flows through YAML template substitution before the shell ever sees it, meaning a maliciously crafted value could inject shell metacharacters. The safe fix is to use the pre-set environment variable `$GITHUB_ACTION_PATH` instead:

    run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"

Locations:

- `action.yml:56`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in hardened/action/action.yml line 56: replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. The pre-set $GITHUB_ACTION_PATH environment variable is safe to use directly in shell commands, unlike the ${{ github.action_path }} expression which flows through YAML template substitution before the shell sees it.

