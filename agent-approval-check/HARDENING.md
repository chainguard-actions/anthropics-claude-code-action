<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.216

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.216** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A GitHub Actions expression `${{ github.action_path }}` is interpolated directly inside a `run:` shell command string: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Any `${{ ... }}` expression directly in a `run:` block is a script-injection risk because the value is substituted into the shell command before the shell parses it. The safe alternative is to use the pre-set environment variable `$GITHUB_ACTION_PATH` instead, which is already available in composite action steps without any template substitution.

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced `${{ github.action_path }}` in the `run:` shell command at line 57 of action.yml with the pre-set environment variable `$GITHUB_ACTION_PATH`. This variable is set by the GitHub Actions runner for composite actions and is available without any template substitution, eliminating the script-injection risk. No other changes were needed.

