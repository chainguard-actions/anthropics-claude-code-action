<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.225

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.225** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Rule (a) violation: A ${{ }} expression is directly interpolated inside a `run:` shell command string. The step at line 56 of action.yml contains: `run: python "${{ github.action_path }}/agent_approval_check.py"`. Per the script-injection check, ANY `${{ ... }}` expression directly inside a `run:` block is a finding — the YAML template substitution occurs before the shell ever sees the string, meaning a maliciously crafted value could inject shell metacharacters. The safe fix is to use the pre-set `$GITHUB_ACTION_PATH` environment variable instead: `run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"`

Locations:

- `action.yml:56`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Replaced `${{ github.action_path }}` in the `run:` block at line 56 of action.yml with the pre-set `$GITHUB_ACTION_PATH` environment variable. GitHub Actions automatically sets this variable to the same value, so functionality is preserved while eliminating the script-injection risk.

