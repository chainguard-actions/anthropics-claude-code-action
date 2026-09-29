<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.213

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.213** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A `${{ github.action_path }}` expression is interpolated directly inside a `run:` shell command string. Any `${{ ... }}` expression in a `run:` block is a script-injection risk because the value is substituted into the shell command before the shell parses it. The safe alternative is to use the pre-set environment variable `$GITHUB_ACTION_PATH` instead of `${{ github.action_path }}`.

Offending line:
  `- run: python "${{ github.action_path }}/agent_approval_check.py"`

Locations:

- `action.yml:55`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced `${{ github.action_path }}` with `$GITHUB_ACTION_PATH` in the `run:` step of action.yml (line 55). The pre-set environment variable `$GITHUB_ACTION_PATH` is the safe alternative — it is set by the GitHub Actions runner and is not subject to expression injection, whereas the `${{ ... }}` form is substituted into the shell command string before the shell parses it.

