# 🚀 Quick Start Guide - Continue Phase 2 Implementation

**Last Session**: 2026-02-15
**Status**: Phase 1 Complete (Application Evolution) - 98.4% tests passing
**Next Focus**: Fix remaining tests, then Infrastructure (Kubernetes, Terraform, CI/CD)

---

## ⚡ Quick Status

### ✅ What's Done
- Money Value Object (29 tests ✓)
- Custom Domain Exceptions (4 new exceptions ✓)
- Type Safety Refactoring (no more `any` types ✓)
- Priority-Based Sorting API (with swagger docs ✓)
- Email Notification Service (MVP console.log ✓)
- ServiceOrder Entity using Money VO ✓

### ⚠️ What Needs Fixing
- **6 failing tests** (375/381 passing = 98.4%)
- 2 test files need mock updates

### 📋 What's Next
1. Fix failing tests (30 min)
2. Create Kubernetes manifests (4-6 hours)
3. Create Terraform infrastructure (6-8 hours)
4. Setup CI/CD with GitHub Actions (3-4 hours)
5. Update documentation (2-3 hours)

---

## 🏃 Start Here Tomorrow

### Step 1: Verify Current State (5 minutes)

```bash
# Navigate to project
cd /Users/julioejacque/Documents/projects/fiap/FiapMecanica

# Pull latest changes (if working with team)
git pull origin fase2

# Install dependencies (if needed)
npm install

# Check build
npm run build

# Run tests to see current status
npm test
```

### Step 2: Fix Failing Tests (30 minutes)

**Failing Files:**
1. `src/application/use-cases/service-order/create-service-order.use-case.spec.ts`
2. `src/application/use-cases/service-order/list-service-orders.use-case.spec.ts`

**Common Fixes Needed:**

```typescript
// ISSUE 1: Money VO assertions
// ❌ WRONG
expect(serviceOrder.getTotalAmount()).toBe(100);

// ✅ CORRECT
expect(serviceOrder.getTotalAmount().toNumber()).toBe(100);

// ISSUE 2: Missing mocks for new dependencies
// Add to beforeEach in use-case tests:
const mockCustomerRepo = {
  findById: jest.fn(),
};

const mockEmailService = {
  sendStatusUpdateEmail: jest.fn(),
};

// Add to providers:
{
  provide: CustomerRepositoryPort,
  useValue: mockCustomerRepo,
},
{
  provide: EmailServicePort,
  useValue: mockEmailService,
}
```

**Run tests after fixes:**
```bash
# Test specific files
npm test -- create-service-order.use-case.spec.ts
npm test -- list-service-orders.use-case.spec.ts

# Verify all tests pass
npm test

# Generate coverage
npm run test:cov
# Target: 80%+ on domain/application layers
```

### Step 3: Create Health Check Endpoint (15 minutes)

**File to Create:** `src/presentation/controllers/health.controller.ts`

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '@infrastructure/database/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint for Kubernetes probes' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      };
    }
  }
}
```

**Register in:** `src/app.module.ts`
```typescript
import { HealthController } from '@presentation/controllers/health.controller';

@Module({
  controllers: [HealthController],
  // ... rest
})
```

**Test:**
```bash
npm run start:dev
curl http://localhost:3000/api/v1/health
```

---

## 📁 Files Created in Last Session

### Domain Layer
- `src/domain/value-objects/money.value-object.ts`
- `src/domain/value-objects/money.value-object.spec.ts`
- `src/domain/utils/service-order-priority.util.ts`

### Shared Layer
- `src/shared/exceptions/insufficient-stock.exception.ts`
- `src/shared/exceptions/invalid-status-transition.exception.ts`
- `src/shared/exceptions/vehicle-ownership.exception.ts`
- `src/shared/exceptions/service-inactive.exception.ts`
- + all `.spec.ts` files for exceptions

### Application Layer
- `src/application/ports/email.service.port.ts`

### Infrastructure Layer
- `src/infrastructure/services/email.service.ts`
- `src/modules/email.module.ts`

### Documentation
- `docs/PHASE2_CONTINUATION_PLAN.md` (comprehensive guide)
- `docs/QUICK_START_TOMORROW.md` (this file)

---

## 🎯 Priority Tasks List

### High Priority (Must Do)
1. ✅ Fix 6 failing tests
2. ✅ Create health check endpoint
3. ✅ Verify all tests pass (381/381)

### Medium Priority (Should Do)
4. ⬜ Create Kubernetes manifests (see detailed guide in PHASE2_CONTINUATION_PLAN.md)
5. ⬜ Optimize Dockerfile
6. ⬜ Create basic Terraform structure

### Lower Priority (Nice to Have)
7. ⬜ Complete Terraform modules
8. ⬜ Setup GitHub Actions CI/CD
9. ⬜ Update documentation
10. ⬜ Create architecture diagrams

---

## 📖 Key Documentation Files

### For Implementation Details
- **Full Plan**: `docs/PHASE2_CONTINUATION_PLAN.md`
  - Complete Kubernetes manifests with code
  - Full Terraform modules with examples
  - CI/CD pipeline configurations
  - Cost estimates and verification commands

### For Original Requirements
- **Original Plan**: Check plan mode transcript if available
- **Requirements**: Phase 2 plan document (created during planning)

---

## 🧪 Testing Strategy

### Unit Tests
```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:cov

# Run specific test file
npm test -- service-order.entity.spec.ts

# Watch mode (useful while fixing tests)
npm test -- --watch
```

### E2E Tests
```bash
# Run e2e tests
npm run test:e2e

# Run specific e2e test
npm run test:e2e -- --testNamePattern="should sort by priority"
```

### Integration Testing
```bash
# Start dev server
npm run start:dev

# Test endpoints with curl or Postman
curl http://localhost:3000/api/v1/service-orders?sortByPriority=true
```

---

## 🔧 Useful Commands

### Development
```bash
# Start development server
npm run start:dev

# Build production
npm run build

# Format code
npm run format

# Lint code
npm run lint

# Fix lint issues
npm run lint -- --fix
```

### Database
```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio
npx prisma studio

# Reset database (dev only!)
npx prisma migrate reset
```

### Docker
```bash
# Build image
docker build -t fiap-mecanica:latest .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop containers
docker-compose down
```

### Git
```bash
# Check status
git status

# Create branch for next feature
git checkout -b infrastructure/kubernetes

# Commit changes
git add .
git commit -m "feat: add kubernetes manifests"

# Push to remote
git push origin infrastructure/kubernetes
```

---

## 💡 Tips for Success

### Best Practices
1. **Test First**: Run `npm test` before making changes
2. **Small Commits**: Commit after each completed task
3. **Read Errors**: Error messages often contain the solution
4. **Use Coverage**: `npm run test:cov` shows what needs testing
5. **Check Build**: `npm run build` before committing

### Time Management
- **Morning**: Fix tests (30 min) + Health endpoint (15 min) = 45 min
- **Midday**: Start Kubernetes manifests (2-3 hours)
- **Afternoon**: Continue K8s or start Terraform (2-3 hours)
- **End of Day**: Commit progress, update this guide

### Debugging
```bash
# If tests fail mysteriously
npm ci  # Clean install
npx prisma generate  # Regenerate client

# If TypeScript errors
npm run build  # See detailed errors

# If imports not found
# Check tsconfig paths are correct
```

---

## 📞 Get Help

### Error: "Cannot find module '@domain/...'"
- Check `tsconfig.json` paths configuration
- Run `npm run build` to see detailed error
- Ensure file exists at the path

### Error: "Nest can't resolve dependencies"
- Check module imports
- Ensure all providers are registered
- Verify dependency injection setup

### Error: Tests failing with "connection refused"
- Ensure test database is running
- Check DATABASE_URL in test environment
- Run `npx prisma migrate deploy` for test DB

---

## ✅ Today's Success Checklist

Before ending your session, ensure:

- [ ] All tests passing (run `npm test`)
- [ ] Build succeeds (run `npm run build`)
- [ ] Changes committed to git
- [ ] Updated this guide with progress
- [ ] Noted any blockers or questions

---

## 📝 Notes from Last Session

### Decisions Made
- Money VO uses 2 decimal precision (rounds automatically)
- Email service MVP uses console.log (easy to replace with SMTP)
- Priority sorting done in-memory (acceptable for <10k active orders)
- Custom exceptions provide better context than generic ones

### Things to Remember
- ServiceOrder now uses Money VO - update tests to use `.toNumber()`
- Email service injected in UpdateServiceOrderStatusUseCase
- Priority sorting enabled by default (`sortByPriority=true`)
- Completed/Delivered orders excluded by default (`excludeCompleted=true`)

### Known Issues
- 6 tests need mock updates (straightforward fix)
- No breaking changes to existing API (backward compatible)

---

**Ready to start? Begin with Step 1 above! 🚀**

**Questions?** Check `docs/PHASE2_CONTINUATION_PLAN.md` for detailed implementation guides.

**Stuck?** All code examples are in the continuation plan document.
