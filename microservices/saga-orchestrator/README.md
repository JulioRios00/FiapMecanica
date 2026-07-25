# Saga Orchestrator

Orchestrated Saga coordinating the Service Order flow: **Open OS → Quote →
Payment → Execution → Complete**, with compensation (rollback) on failure.

See [`../docs/architecture.md`](../docs/architecture.md) for the component
diagram, the Orchestrated-vs-Choreographed decision, and the sequence
diagrams for both the happy path and the compensation path.

## Responsibilities implemented

- `POST /api/v1/sagas` — start a saga: opens a service order in `os-service`,
  requests a quote, confirms payment, starts execution, and marks the OS
  completed.
- `GET /api/v1/sagas/:id` — query saga status, completed steps, and last
  error.
- Compensation logic (`SagaCompensationService`): on any downstream failure,
  rolls back the steps that already completed, in reverse order, best-effort.
- Persists saga state (status + completed steps) to Postgres via Prisma, so
  progress survives restarts and is queryable.

## Downstream services

- `os-service`: real HTTP client (`HttpOsServiceClient`), since it's
  implemented in this repo.
- `billing-service` / `execution-service`: owned by other teams. By default
  (`USE_MOCK_DOWNSTREAM=true`) the orchestrator talks to in-process mocks
  (`infra/mocks/*`) so the full saga — including compensation — can be run
  and demoed without those services existing yet. HTTP clients matching the
  same ports (`infra/clients/http-billing-service.client.ts`,
  `infra/clients/http-execution-service.client.ts`) are ready to swap in via
  `USE_MOCK_DOWNSTREAM=false` once those services are deployed.
- The mocks honor a `correlationId` of `"fail:<STEP>"` (e.g.
  `"fail:START_EXECUTION"`) to deliberately fail a step and demonstrate
  compensation through the real API — see `infra/mocks/simulated-failure.ts`.

## Architecture

```text
src/
  application/
    ports/           # OsServicePort, BillingServicePort, ExecutionServicePort, SagaRepositoryPort
    services/         # SagaCompensationService
    use-cases/        # StartServiceOrderSagaUseCase, GetSagaStatusUseCase
  domain/
    entities/          # SagaInstance (status, completed steps)
  infra/
    clients/           # HTTP adapters for the ports (real contracts)
    mocks/             # In-process stand-ins for billing/execution
    database/          # PrismaService
    repositories/      # PrismaSagaRepository
  presentation/
    controllers/       # SagaController, HealthController
    dtos/
  modules/
```

## Run

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

Or via Docker (own Postgres on `5436`, app on `3020`):

```bash
docker compose up --build
```

## Testing

Unit tests cover the domain entity, the compensation service (one test per
compensation branch), and the orchestration use-case (happy path, failure
before OS creation, and compensated failures at different steps).

```bash
npm test          # run once
npm run test:cov  # run with coverage report (coverage/lcov.info)
```

## Code quality (SonarQube, local)

Same local SonarQube workflow as `os-service`:

```bash
npm run sonar:up
# open http://localhost:9000, log in, generate a token
export SONAR_TOKEN=<token>
npm run sonar
npm run sonar:down
```
