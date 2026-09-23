<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.230

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.230** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A `${{ github.action_path }}` expression is directly interpolated inside a `run:` shell command string. Per the security rules, ANY `${{ ... }}` expression inside a `run:` block is a script-injection risk, as the value flows through YAML template substitution before the shell processes it. The offending line is: `run: python "${{ github.action_path }}/agent_approval_check.py"`. The safe alternative is to use the `$GITHUB_ACTION_PATH` environment variable instead (e.g., `run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"`), which is already available as a pre-set environment variable and avoids direct expression interpolation.

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced `${{ github.action_path }}` in the `run:` block (action.yml line 57) with the pre-set `$GITHUB_ACTION_PATH` environment variable. This eliminates the YAML template interpolation that could allow script injection, while maintaining the same runtime behavior since GitHub Actions automatically sets GITHUB_ACTION_PATH to the action's directory path.

