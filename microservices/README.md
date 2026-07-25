# Microservices Repositories (Local Scaffold)

This folder holds local checkouts of the independent repositories that make up the system:

1. `os-service` — extracted into its own repository: [github.com/JulioRios00/fiap-os-service](https://github.com/JulioRios00/fiap-os-service).
   Kept as a local checkout here (nested `.git`, auto-ignored by this folder) so it can still be run alongside
   `saga-orchestrator`; not tracked by this repo.
2. `billing-service` — owned by a teammate, implemented in its own repository (nested `.git`, not tracked here).
3. `execution-service-api` — owned by a teammate, implemented in its own repository (nested `.git`, not tracked here).
4. `saga-orchestrator` (implemented in this repo)

## Scope implemented in this iteration

- OS Service: open service order, update status, query, history, and domain event publication to outbox.
- OS Service: unit tests (Jest) for domain + application layers, ~99% coverage.
- OS Service: local SonarQube (Community Edition, Docker) for code quality analysis — see `os-service/README.md`.
- OS Service: CI/CD pipeline (test + coverage + build, then Docker build/push to GHCR on `main`).
- Saga Orchestrator: orchestrated Saga coordination for the OS → Quote → Payment → Execution flow, backed by
  Prisma/Postgres, with compensation logic for failures at any step — see `saga-orchestrator/README.md`.
- Saga Orchestrator: unit tests (Jest) for the domain entity, compensation service, and orchestration use-case.
- Saga Orchestrator: real adapters for both teammate services (REST for billing-service, RabbitMQ for
  execution-service-api, which is choreography-only) behind a `USE_MOCK_DOWNSTREAM` toggle — in-process mocks
  by default so the full flow, including compensation, can be run end-to-end without either running.
- Architecture documentation: component diagram, Saga strategy (Orchestrated vs. Choreographed) and rationale,
  the real integration details/known gaps with billing-service and execution-service-api, and sequence diagrams
  for both the happy path and the compensation path — see `docs/architecture.md`.

