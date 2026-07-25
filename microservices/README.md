# Microservices Repositories (Local Scaffold)

This folder contains local, independent repository-ready scaffolds for:

1. `os-service` (implemented)
2. `billing-service` (scaffold only)
3. `execution-service` (scaffold only)
4. `saga-orchestrator` (implemented)

## Scope implemented in this iteration

- OS Service: open service order, update status, query, history, and domain event publication to outbox.
- OS Service: unit tests (Jest) for domain + application layers, ~99% coverage.
- OS Service: local SonarQube (Community Edition, Docker) for code quality analysis — see `os-service/README.md`.
- Saga Orchestrator: orchestrated Saga coordination for the OS → Quote → Payment → Execution flow, backed by
  Prisma/Postgres, with compensation logic for failures at any step — see `saga-orchestrator/README.md`.
- Saga Orchestrator: unit tests (Jest) for the domain entity, compensation service, and orchestration use-case.
- Billing/Execution services are owned by other teams; the saga talks to in-process mocks for them by default
  (`USE_MOCK_DOWNSTREAM=true`) so the full flow, including compensation, can be run end-to-end today.
- Architecture documentation: component diagram, Saga strategy (Orchestrated vs. Choreographed) and rationale,
  and sequence diagrams for both the happy path and the compensation path — see `docs/architecture.md`.

