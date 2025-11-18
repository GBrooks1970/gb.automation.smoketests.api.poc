# New Demo Plan Backlog
_Version 1 - 18/11/25_

This backlog tracks phased plans for future Token Parser automation demos. Use it to record design alignment, execution steps, and validation signals before implementation begins.

## DEMOAPP005 - Token Parser Automation Stack (placeholder)

### Phase 0 - Discovery & Alignment
- Define runtime/tooling (e.g., Go + k6 load focus) and confirm API contract requirements.
- Identify Screenplay expectations and parity impact across existing stacks.
- **Acceptance**: Design brief reviewed by demo leads; entry added to Backlog_Parity.md.

### Phase 1 - API Host & Parsers
- Implement or integrate API endpoints (consider reusing shared TS API if applicable) with logging/Swagger parity.
- Validate parser behaviour matches canonical implementations.
- **Acceptance**: `/alive` responds; tokenparser_api_contract.md updated with new host info.

### Phase 2 - Screenplay + Features
- Import shared features (once repository is ready) and wire actors/abilities/tasks/questions/memory.
- Ensure tagging strategy matches util first, API second execution order.
- **Acceptance**: Util + API tests pass locally; screenplay_parity_demoapps.md updated with new stack details.

### Phase 3 - Automation & Metrics
- Author per-project runner following batch_runner_design.md; hook into RUN_ALL_API_AND_TESTS.
- Ensure `.results` logs and metrics renderer entries exist for util/api suites.
- **Acceptance**: Orchestrator run includes "New Demo" entry with accurate counts and log references.

### Phase 4 - Documentation & Quality Gates
- Update README, architecture/QA/Screenplay docs, comparison report, and Backlog parity notes.
- Establish lint/format/test commands + CI jobs.
- **Acceptance**: Documentation PR merged, CI gates green, backlog entries updated with remaining work (if any).
