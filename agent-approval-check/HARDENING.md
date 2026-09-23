<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.232

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.232** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ }} expression is directly interpolated inside a `run:` shell command string. On line 56, the step runs: `python "${{ github.action_path }}/agent_approval_check.py"`. The expression `${{ github.action_path }}` is substituted by the Actions runner into the shell command before the shell executes it, bypassing shell quoting. The safe alternative is to use the pre-set environment variable `$ACTION_PATH` (or `$GITHUB_ACTION_PATH`) which GitHub Actions populates automatically, avoiding any direct expression interpolation in the `run:` block.

Locations:

- `action.yml:56`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection on line 56 of action.yml by replacing `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. The `$GITHUB_ACTION_PATH` environment variable is automatically set by GitHub Actions and avoids direct expression interpolation in the run: block, eliminating the injection risk.

