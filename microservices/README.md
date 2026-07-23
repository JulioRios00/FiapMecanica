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
- Saga Orchestrator: orchestrated Saga coordination for OS flow, including compensation logic.
- Architecture documentation: final architecture diagram + Saga strategy notes.

