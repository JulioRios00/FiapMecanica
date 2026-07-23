# OS Service

Independent microservice for Service Orders.

## Responsibilities implemented

- Open service order
- Update service order status
- Query service order
- Query status history
- Publish versioned domain events to outbox:
  - `v1.OSCreated`
  - `v1.OSStatusUpdated`
  - `v1.OSCancelled`

## Architecture

```text
src/
  application/
  domain/
  infra/
  presentation/
  shared/
  config/
```

## Run

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

## Testing

Unit tests cover the domain entity/events and all application use-cases
(repository and event-publisher ports are mocked).

```bash
npm test          # run once
npm run test:cov  # run with coverage report (coverage/lcov.info)
```

Current coverage on `domain/` + `application/`: **~99%** statements (target: 80%).

## Code quality (SonarQube, local)

Static analysis and coverage are checked with a local SonarQube Community
Edition instance (no SonarCloud account required):

```bash
# 1. Start SonarQube (first run pulls the image, takes a few minutes)
npm run sonar:up

# 2. Open http://localhost:9000, log in (default admin/admin, you'll be
#    asked to change the password on first login), then:
#    My Account -> Security -> Generate Tokens

# 3. Run tests + scan
export SONAR_TOKEN=<token-from-step-2>
npm run sonar

# 4. Stop SonarQube when done
npm run sonar:down
```

Results are published to the local dashboard at `http://localhost:9000`.
Configuration lives in `sonar-project.properties` (sources, exclusions, and
the `coverage/lcov.info` report path produced by `npm run test:cov`).

