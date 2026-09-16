<!-- markdownlint-disable -->

# Hardening Report: anthropics--claude-code-action--agent-approval-check/v1.0.226

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **anthropics--claude-code-action--agent-approval-check/v1.0.226** was hardened automatically. 1 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): A ${{ ... }} expression is directly interpolated inside a `run:` shell command string. The step runs: `python "${{ github.action_path }}/agent_approval_check.py"`. The `github.action_path` value flows through YAML template substitution before the shell ever sees it, making this a script-injection risk. It should be replaced with the safe env-var equivalent `$GITHUB_ACTION_PATH` (which GitHub Actions pre-populates as an environment variable), e.g.: `run: python "$GITHUB_ACTION_PATH/agent_approval_check.py"`

Locations:

- `action.yml:57`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection

**Notes:**

Fixed script-injection in hardened/action/action.yml line 57: replaced `python "${{ github.action_path }}/agent_approval_check.py"` with `python "$GITHUB_ACTION_PATH/agent_approval_check.py"`. GitHub Actions pre-populates $GITHUB_ACTION_PATH as a safe environment variable, so there is no need to use the ${{ }} template expression which flows through YAML substitution before the shell sees it.

