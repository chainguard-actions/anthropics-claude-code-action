<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.242

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.242** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A GitHub Actions expression `${{ github.action_path }}` is directly interpolated inside a `run:` shell command string. Per the check rules, ANY `${{ ... }}` expression in a `run:` block is a script-injection risk because the value flows through YAML template substitution before the shell ever sees it. The offending line is: `run: python "${{ github.action_path }}/agent_approval_check.py"`. This should be replaced with the environment variable `$GITHUB_ACTION_PATH` (which GitHub Actions pre-populates), e.g.: `run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"`

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced `${{ github.action_path }}` in the `run:` block at action.yml line 57 with the pre-populated environment variable `$GITHUB_ACTION_PATH`. GitHub Actions automatically sets this variable to the same value, so the behavior is identical but the expression no longer flows through YAML template substitution before reaching the shell.

