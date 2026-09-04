<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.214

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.214** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A `${{ ... }}` expression is directly interpolated inside a `run:` shell command string. Line 57 of action.yml contains: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Even though `github.action_path` is not directly attacker-controlled, any `${{ ... }}` expression inside a `run:` block undergoes YAML template substitution before the shell ever sees it, making it a script-injection risk. The fix is to use the pre-set environment variable `$GITHUB_ACTION_PATH` instead: `run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"`

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced `${{ github.action_path }}` in the `run:` block with the pre-set environment variable `$GITHUB_ACTION_PATH`. The GitHub Actions runner automatically sets `GITHUB_ACTION_PATH` to the action's directory path, so this is a safe, equivalent substitution that avoids YAML template interpolation inside a shell command string.

