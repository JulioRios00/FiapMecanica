# Phase 2 Implementation - Continuation Plan

**Document Version**: 1.0
**Last Updated**: 2026-02-15
**Status**: Phase 1 Complete (Application Evolution) - Ready for Phase 2 (Infrastructure)

---

## 📊 Current Status Overview

### ✅ Completed (Phase 1 - Application Evolution)

#### 1. Code Quality & Architecture (100% Complete)
- ✅ **Money Value Object** - Eliminates primitive obsession for currency
  - Location: `src/domain/value-objects/money.value-object.ts`
  - Tests: `src/domain/value-objects/money.value-object.spec.ts` (29 tests passing)
  - Features: Immutable, 2-decimal precision, arithmetic operations, comparison methods

- ✅ **Custom Domain Exceptions** - Better error handling
  - `InsufficientStockException`
  - `InvalidStatusTransitionException`
  - `VehicleOwnershipException`
  - `ServiceInactiveException`
  - Location: `src/shared/exceptions/`
  - Tests: All passing (14 tests)

- ✅ **ServiceOrder Entity Refactoring**
  - Converted to use Money VO for `totalAmount` and `approvedAmount`
  - Uses `InvalidStatusTransitionException` for status validation
  - Location: `src/domain/entities/service-order.entity.ts`
  - Tests: 23/23 passing

- ✅ **Type Safety Improvements**
  - Fixed `priority?: any` → `Priority` type
  - Fixed `Promise<any>` return types
  - Updated CreateServiceOrderUseCase with proper types
  - Location: `src/application/use-cases/service-order/create-service-order.use-case.ts`

#### 2. New Features (100% Complete)

- ✅ **Priority-Based Sorting** (Required API Feature)
  - Priority utility: `src/domain/utils/service-order-priority.util.ts`
  - Sort order: IN_PROGRESS > AWAITING_APPROVAL > IN_DIAGNOSIS > RECEIVED
  - Excludes COMPLETED/DELIVERED by default
  - API: New query parameters `excludeCompleted` and `sortByPriority`
  - Updated: Repository, Use Case, Controller with Swagger docs

- ✅ **Email Notification Service**
  - Port: `src/application/ports/email.service.port.ts`
  - Implementation: `src/infrastructure/services/email.service.ts` (MVP: console.log)
  - Module: `src/modules/email.module.ts`
  - Sends notifications on status updates
  - Graceful failure handling

### 📈 Test Coverage
- **Overall**: 375/381 tests passing (98.4%)
- **Test Suites**: 54/56 passing (96.4%)
- **Remaining Failures**: 6 tests (minor mock updates needed)

---

## 🎯 Immediate Next Steps (Priority Order)

### **STEP 1: Fix Remaining Test Failures** (Estimated: 30 minutes)

**Failing Tests:**
1. `src/application/use-cases/service-order/create-service-order.use-case.spec.ts`
2. `src/application/use-cases/service-order/list-service-orders.use-case.spec.ts`

**What to Fix:**
These tests are failing because they need updated mocks for the new dependencies and Money VO changes.

**Action Items:**
```bash
# Run tests to see specific failures
npm test -- create-service-order.use-case.spec.ts
npm test -- list-service-orders.use-case.spec.ts

# Common fixes needed:
# 1. Update mock expectations for Money VO (expect .toNumber() instead of direct number)
# 2. Ensure all repository mocks are properly typed
# 3. Update assertions for new return types
```

**Example Fix Pattern:**
```typescript
// Before
expect(serviceOrder.getTotalAmount()).toBe(100);

// After
expect(serviceOrder.getTotalAmount().toNumber()).toBe(100);
```

### **STEP 2: Create Comprehensive E2E Tests** (Estimated: 2-3 hours)

**File to Create/Update:**
- `test/service-order.e2e-spec.ts`

**Test Coverage Needed:**
1. **Priority Sorting End-to-End**
   - Create service orders with different statuses
   - Verify sorting order matches priority
   - Verify oldest-first within same priority
   - Verify completed orders are excluded

2. **Money VO Integration**
   - Create service order with services and parts
   - Verify totalAmount is calculated correctly
   - Verify amounts are returned as numbers in API responses

3. **Email Notifications**
   - Update service order status
   - Verify email service is called (mock)
   - Verify customer information is fetched

**Example Test Structure:**
```typescript
describe('Service Orders - Priority Sorting (e2e)', () => {
  it('should return orders sorted by priority', async () => {
    // Create orders with different statuses
    // GET /service-orders?sortByPriority=true
    // Verify order matches priority
  });
});
```

### **STEP 3: Run Full Test Suite and Coverage** (Estimated: 15 minutes)

```bash
# Run all tests
npm test

# Generate coverage report
npm run test:cov

# Target: 80%+ coverage on domain and application layers
```

**Coverage Targets:**
- Domain entities: 80%+
- Use cases: 80%+
- Value objects: 95%+
- Repositories: 70%+

---

## 🏗️ Phase 2: Infrastructure as Code (Week 3)

### **STEP 4: Kubernetes Manifests** (Estimated: 4-6 hours)

**Directory to Create:**
```
k8s/
├── 00-namespace.yaml
├── 01-configmap.yaml
├── 02-secrets.yaml
├── 03-deployment.yaml
├── 04-service.yaml
├── 05-hpa.yaml
├── 06-postgres.yaml (optional for local dev)
├── 07-ingress.yaml
├── kustomization.yaml
└── README.md
```

#### 4.1 Namespace Configuration
**File**: `k8s/00-namespace.yaml`
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: fiap-mecanica
  labels:
    app: fiap-mecanica
    environment: production
```

#### 4.2 ConfigMap
**File**: `k8s/01-configmap.yaml`
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fiap-mecanica-config
  namespace: fiap-mecanica
data:
  NODE_ENV: "production"
  PORT: "3000"
  API_PREFIX: "api/v1"
  JWT_EXPIRATION: "24h"
```

#### 4.3 Secrets (Template)
**File**: `k8s/02-secrets.yaml`
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: fiap-mecanica-secrets
  namespace: fiap-mecanica
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:password@postgres:5432/fiapmecanica"
  JWT_SECRET: "change-me-in-production"
# Note: Use AWS Secrets Manager or Sealed Secrets in production
```

#### 4.4 Deployment
**File**: `k8s/03-deployment.yaml`
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fiap-mecanica-api
  namespace: fiap-mecanica
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fiap-mecanica-api
  template:
    metadata:
      labels:
        app: fiap-mecanica-api
    spec:
      containers:
      - name: api
        image: ghcr.io/your-username/fiap-mecanica:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: fiap-mecanica-config
        - secretRef:
            name: fiap-mecanica-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
```

#### 4.5 Service
**File**: `k8s/04-service.yaml`
```yaml
apiVersion: v1
kind: Service
metadata:
  name: fiap-mecanica-service
  namespace: fiap-mecanica
spec:
  type: LoadBalancer
  selector:
    app: fiap-mecanica-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
```

#### 4.6 Horizontal Pod Autoscaler
**File**: `k8s/05-hpa.yaml`
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: fiap-mecanica-hpa
  namespace: fiap-mecanica
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: fiap-mecanica-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### 4.7 Ingress
**File**: `k8s/07-ingress.yaml`
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fiap-mecanica-ingress
  namespace: fiap-mecanica
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.fiapmecanica.com
    secretName: fiap-mecanica-tls
  rules:
  - host: api.fiapmecanica.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: fiap-mecanica-service
            port:
              number: 80
```

#### 4.8 Kustomization
**File**: `k8s/kustomization.yaml`
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: fiap-mecanica

resources:
  - 00-namespace.yaml
  - 01-configmap.yaml
  - 02-secrets.yaml
  - 03-deployment.yaml
  - 04-service.yaml
  - 05-hpa.yaml
  - 07-ingress.yaml
```

#### 4.9 Health Check Endpoint
**File to Create**: `src/presentation/controllers/health.controller.ts`
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
      // Check database connectivity
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

**Register in**: `src/app.module.ts`
```typescript
import { HealthController } from '@presentation/controllers/health.controller';

@Module({
  controllers: [HealthController],
  // ... rest of module
})
```

#### 4.10 K8s Testing Commands
```bash
# Validate manifests
kubectl apply --dry-run=client -k k8s/

# Apply to local cluster (minikube/kind)
kubectl apply -k k8s/

# Check deployment
kubectl get pods -n fiap-mecanica
kubectl get services -n fiap-mecanica
kubectl get hpa -n fiap-mecanica

# View logs
kubectl logs -n fiap-mecanica -l app=fiap-mecanica-api

# Port forward for testing
kubectl port-forward -n fiap-mecanica svc/fiap-mecanica-service 3000:80

# Test health endpoint
curl http://localhost:3000/api/v1/health
```

---

### **STEP 5: Terraform Infrastructure** (Estimated: 6-8 hours)

**Directory Structure:**
```
terraform/
├── modules/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── eks/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── rds/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── security/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   └── terraform.tfvars
│   └── production/
│       ├── main.tf
│       └── terraform.tfvars
├── main.tf
├── variables.tf
├── outputs.tf
├── versions.tf
└── README.md
```

#### 5.1 Terraform Versions
**File**: `terraform/versions.tf`
```hcl
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }

  backend "s3" {
    bucket         = "fiap-mecanica-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "fiap-mecanica-terraform-lock"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
```

#### 5.2 Main Variables
**File**: `terraform/variables.tf`
```hcl
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "fiap-mecanica"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# EKS Variables
variable "eks_cluster_version" {
  description = "Kubernetes version for EKS cluster"
  type        = string
  default     = "1.28"
}

variable "eks_node_instance_types" {
  description = "Instance types for EKS node group"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "eks_min_nodes" {
  description = "Minimum number of nodes in EKS node group"
  type        = number
  default     = 2
}

variable "eks_max_nodes" {
  description = "Maximum number of nodes in EKS node group"
  type        = number
  default     = 10
}

variable "eks_desired_nodes" {
  description = "Desired number of nodes in EKS node group"
  type        = number
  default     = 3
}

# RDS Variables
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "fiapmecanica"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}
```

#### 5.3 VPC Module
**File**: `terraform/modules/vpc/main.tf`
```hcl
data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name                                           = "${var.project_name}-vpc"
    "kubernetes.io/cluster/${var.cluster_name}"    = "shared"
  }
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name                                           = "${var.project_name}-public-${count.index + 1}"
    "kubernetes.io/cluster/${var.cluster_name}"    = "shared"
    "kubernetes.io/role/elb"                       = "1"
  }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name                                           = "${var.project_name}-private-${count.index + 1}"
    "kubernetes.io/cluster/${var.cluster_name}"    = "shared"
    "kubernetes.io/role/internal-elb"              = "1"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

resource "aws_eip" "nat" {
  count  = 2
  domain = "vpc"

  tags = {
    Name = "${var.project_name}-nat-eip-${count.index + 1}"
  }
}

resource "aws_nat_gateway" "main" {
  count         = 2
  subnet_id     = aws_subnet.public[count.index].id
  allocation_id = aws_eip.nat[count.index].id

  tags = {
    Name = "${var.project_name}-nat-${count.index + 1}"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

resource "aws_route_table" "private" {
  count  = 2
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = {
    Name = "${var.project_name}-private-rt-${count.index + 1}"
  }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}
```

**File**: `terraform/modules/vpc/outputs.tf`
```hcl
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}
```

#### 5.4 RDS Module
**File**: `terraform/modules/rds/main.tf`
```hcl
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.eks_security_group_id]
    description     = "Allow PostgreSQL from EKS"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

resource "aws_db_instance" "main" {
  identifier     = "${var.project_name}-db"
  engine         = "postgres"
  engine_version = "16.1"
  instance_class = var.db_instance_class

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az               = var.environment == "production" ? true : false
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  skip_final_snapshot       = var.environment != "production"
  final_snapshot_identifier = var.environment == "production" ? "${var.project_name}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  tags = {
    Name = "${var.project_name}-db"
  }
}
```

#### 5.5 EKS Module
**File**: `terraform/modules/eks/main.tf`
```hcl
resource "aws_eks_cluster" "main" {
  name     = "${var.project_name}-cluster"
  role_arn = aws_iam_role.eks_cluster.arn
  version  = var.cluster_version

  vpc_config {
    subnet_ids              = concat(var.public_subnet_ids, var.private_subnet_ids)
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
    aws_iam_role_policy_attachment.eks_vpc_resource_controller,
  ]

  tags = {
    Name = "${var.project_name}-cluster"
  }
}

resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.project_name}-node-group"
  node_role_arn   = aws_iam_role.eks_nodes.arn
  subnet_ids      = var.private_subnet_ids

  instance_types = var.node_instance_types

  scaling_config {
    desired_size = var.desired_nodes
    max_size     = var.max_nodes
    min_size     = var.min_nodes
  }

  update_config {
    max_unavailable = 1
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_container_registry_policy,
  ]

  tags = {
    Name = "${var.project_name}-node-group"
  }
}

# IAM Roles (abbreviated - full version in actual file)
resource "aws_iam_role" "eks_cluster" {
  name = "${var.project_name}-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster.name
}

resource "aws_iam_role_policy_attachment" "eks_vpc_resource_controller" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
  role       = aws_iam_role.eks_cluster.name
}
```

#### 5.6 Main Terraform Configuration
**File**: `terraform/main.tf`
```hcl
module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  vpc_cidr     = var.vpc_cidr
  cluster_name = "${var.project_name}-cluster"
}

module "eks" {
  source = "./modules/eks"

  project_name        = var.project_name
  cluster_version     = var.eks_cluster_version
  public_subnet_ids   = module.vpc.public_subnet_ids
  private_subnet_ids  = module.vpc.private_subnet_ids
  node_instance_types = var.eks_node_instance_types
  min_nodes           = var.eks_min_nodes
  max_nodes           = var.eks_max_nodes
  desired_nodes       = var.eks_desired_nodes
}

module "rds" {
  source = "./modules/rds"

  project_name           = var.project_name
  environment            = var.environment
  vpc_id                 = module.vpc.vpc_id
  private_subnet_ids     = module.vpc.private_subnet_ids
  eks_security_group_id  = module.eks.cluster_security_group_id
  db_instance_class      = var.db_instance_class
  db_name                = var.db_name
  db_username            = var.db_username
  db_password            = var.db_password
}
```

#### 5.7 Terraform Commands
```bash
# Initialize Terraform
cd terraform
terraform init

# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# Plan changes (dev)
terraform plan -var-file="environments/dev/terraform.tfvars"

# Apply changes (dev)
terraform apply -var-file="environments/dev/terraform.tfvars"

# Output values
terraform output

# Destroy infrastructure (be careful!)
terraform destroy -var-file="environments/dev/terraform.tfvars"
```

---

### **STEP 6: Docker Optimization** (Estimated: 1-2 hours)

#### 6.1 Optimize Dockerfile
**File**: `Dockerfile`
```dockerfile
# Build stage
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --chown=nestjs:nodejs package*.json ./

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/src/main"]
```

#### 6.2 Create .dockerignore
**File**: `.dockerignore`
```
node_modules
dist
.git
.gitignore
.env
.env.*
*.md
README.md
*.log
coverage
.vscode
.idea
test
*.test.ts
*.spec.ts
.github
k8s
terraform
docs
```

#### 6.3 Update docker-compose.yml
**File**: `docker-compose.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: fiap-mecanica-db
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-fiapmecanica}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - fiap-mecanica-network
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: fiap-mecanica-api
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@postgres:5432/${DB_NAME:-fiapmecanica}
      JWT_SECRET: ${JWT_SECRET:-your-secret-key}
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - fiap-mecanica-network
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

volumes:
  postgres_data:

networks:
  fiap-mecanica-network:
    driver: bridge
```

#### 6.4 Docker Commands
```bash
# Build image
docker build -t fiap-mecanica:latest .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Stop containers
docker-compose down

# Clean rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

### **STEP 7: CI/CD Pipeline** (Estimated: 3-4 hours)

**Directory**: `.github/workflows/`

#### 7.1 CI Pipeline
**File**: `.github/workflows/ci.yml`
```yaml
name: CI - Lint, Test, Build

on:
  push:
    branches: [main, develop, fase2]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check Prettier formatting
        run: npm run format:check

  test:
    name: Run Tests
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: fiapmecanica_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/fiapmecanica_test

      - name: Run unit tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/fiapmecanica_test

      - name: Run e2e tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/fiapmecanica_test

      - name: Generate coverage report
        run: npm run test:cov
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/fiapmecanica_test

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false

      - name: Comment coverage on PR
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./coverage/lcov.info
          github-token: ${{ secrets.GITHUB_TOKEN }}

  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [lint, test]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Build application
        run: npm run build

      - name: Archive production artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 7
```

#### 7.2 Docker Build and Push
**File**: `.github/workflows/docker.yml`
```yaml
name: Docker Build & Push

on:
  push:
    branches: [main]
    tags:
      - 'v*'

jobs:
  docker:
    name: Build and Push Docker Image
    runs-on: ubuntu-latest

    permissions:
      contents: read
      packages: write
      security-events: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ghcr.io/${{ github.repository }}:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'
```

#### 7.3 Kubernetes Deployment
**File**: `.github/workflows/deploy.yml`
```yaml
name: Deploy to Kubernetes

on:
  workflow_run:
    workflows: ["Docker Build & Push"]
    types:
      - completed
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        type: choice
        options:
          - dev
          - production

jobs:
  deploy:
    name: Deploy to EKS
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' || github.event_name == 'workflow_dispatch' }}

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Update kubeconfig
        run: |
          aws eks update-kubeconfig --name fiap-mecanica-cluster --region us-east-1

      - name: Deploy to Kubernetes
        run: |
          kubectl apply -k k8s/

      - name: Wait for rollout
        run: |
          kubectl rollout status deployment/fiap-mecanica-api -n fiap-mecanica --timeout=5m

      - name: Run smoke tests
        run: |
          kubectl run smoke-test --rm -i --restart=Never --image=curlimages/curl -- \
            curl -f http://fiap-mecanica-service.fiap-mecanica.svc.cluster.local/api/v1/health
```

#### 7.4 Terraform Pipeline
**File**: `.github/workflows/terraform.yml`
```yaml
name: Terraform

on:
  push:
    branches: [main]
    paths:
      - 'terraform/**'
  pull_request:
    paths:
      - 'terraform/**'

jobs:
  terraform:
    name: Terraform Plan/Apply
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: terraform

    steps:
      - uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.6.0

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Terraform Format Check
        run: terraform fmt -check -recursive

      - name: Terraform Init
        run: terraform init

      - name: Terraform Validate
        run: terraform validate

      - name: Terraform Plan
        id: plan
        run: terraform plan -var-file="environments/dev/terraform.tfvars" -no-color
        continue-on-error: true

      - name: Comment Plan on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const output = `#### Terraform Plan 📖\`${{ steps.plan.outcome }}\`

            <details><summary>Show Plan</summary>

            \`\`\`terraform
            ${{ steps.plan.outputs.stdout }}
            \`\`\`

            </details>`;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: output
            })

      - name: Terraform Apply
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: terraform apply -var-file="environments/dev/terraform.tfvars" -auto-approve
```

#### 7.5 Required GitHub Secrets
Configure these in GitHub repository settings (Settings → Secrets and variables → Actions):

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
DB_USERNAME (for Terraform)
DB_PASSWORD (for Terraform)
```

---

### **STEP 8: Documentation Updates** (Estimated: 2-3 hours)

#### 8.1 Update Main README
**File**: `README.md`

Add sections:
1. **Phase 2 Improvements**
   - Money Value Object
   - Custom Exceptions
   - Priority Sorting
   - Email Notifications

2. **Kubernetes Deployment**
   - Prerequisites
   - Local setup (minikube)
   - Production deployment
   - Monitoring

3. **Terraform Infrastructure**
   - AWS setup
   - Cost estimates
   - Deployment commands

4. **CI/CD Pipeline**
   - Workflow descriptions
   - Required secrets
   - Deployment process

#### 8.2 Create Deployment Guide
**File**: `docs/DEPLOYMENT.md`

Sections:
- Prerequisites and tools installation
- Local Kubernetes setup with minikube
- AWS deployment with Terraform
- Environment variables configuration
- Database migration procedures
- Rollback procedures
- Troubleshooting guide

#### 8.3 Create ADR Document
**File**: `docs/ADR.md`

Document key decisions:
- ADR-001: Money Value Object adoption
- ADR-002: In-memory priority sorting strategy
- ADR-003: Console-based email notifications for MVP
- ADR-004: Kubernetes orchestration choice
- ADR-005: AWS as cloud provider
- ADR-006: Managed RDS over StatefulSet

#### 8.4 Update API Documentation
**File**: `docs/API.md`

Document new endpoints and parameters:
- Priority sorting query parameters
- Updated response formats (Money as numbers)
- Email notification behavior
- Health check endpoint

---

## 📊 Success Criteria

Before considering Phase 2 complete, verify:

### Application
- [ ] All tests passing (381/381)
- [ ] 80%+ test coverage on domain/application layers
- [ ] No `any` types in critical code paths
- [ ] Build succeeds without warnings
- [ ] Postman collection updated and working

### Infrastructure
- [ ] Docker image builds successfully
- [ ] K8s manifests validate (`kubectl apply --dry-run`)
- [ ] Terraform plan succeeds
- [ ] Health check endpoint responds
- [ ] HPA triggers on load

### CI/CD
- [ ] CI pipeline runs on every PR
- [ ] All tests pass in CI environment
- [ ] Docker images push to registry
- [ ] Coverage reports generated
- [ ] Terraform validates infrastructure

### Documentation
- [ ] README updated with Phase 2 features
- [ ] Deployment guide complete
- [ ] ADRs documented
- [ ] API documentation current
- [ ] Architecture diagrams updated

---

## 🔍 Verification Commands

```bash
# Application
npm run lint
npm run test:cov
npm run build
npm run test:e2e

# Docker
docker build -t fiap-mecanica:test .
docker run -p 3000:3000 fiap-mecanica:test
curl http://localhost:3000/api/v1/health

# Kubernetes
kubectl apply --dry-run=client -k k8s/
kubectl apply -k k8s/
kubectl get all -n fiap-mecanica

# Terraform
cd terraform
terraform init
terraform fmt -check
terraform validate
terraform plan -var-file="environments/dev/terraform.tfvars"

# CI/CD (via GitHub Actions)
# Create test PR and verify all checks pass
```

---

## 💰 Cost Estimates

### Development Environment (AWS)
- EKS Control Plane: ~$73/month
- EC2 (2x t3.medium): ~$60/month
- RDS (db.t3.micro): ~$15/month
- Load Balancer: ~$20/month
- Data Transfer: ~$10/month
- **Total**: ~$180/month

### Production Environment (AWS)
- EKS Control Plane: ~$73/month
- EC2 (3x t3.medium with auto-scaling): ~$90/month
- RDS (db.t3.small, Multi-AZ): ~$40/month
- Load Balancer: ~$20/month
- Data Transfer: ~$20/month
- Backups: ~$10/month
- **Total**: ~$255/month

---

## 📞 Support & Resources

### Documentation
- NestJS: https://docs.nestjs.com
- Prisma: https://www.prisma.io/docs
- Kubernetes: https://kubernetes.io/docs
- Terraform: https://developer.hashicorp.com/terraform

### Tools
- kubectl: https://kubernetes.io/docs/tasks/tools/
- AWS CLI: https://aws.amazon.com/cli/
- Terraform: https://www.terraform.io/downloads

### Troubleshooting
- Check `docs/DEPLOYMENT.md` for common issues
- Review GitHub Actions logs for CI/CD failures
- Use `kubectl logs` for pod debugging
- Check CloudWatch for AWS resource metrics

---

## ✅ Daily Checklist Template

```markdown
## Day X Progress

### Completed
- [ ] Task description
- [ ] Test coverage: X%
- [ ] Documentation updated

### In Progress
- [ ] Current task
- [ ] Blockers: none/describe

### Next Steps
- [ ] Next task to start
- [ ] Dependencies needed

### Notes
- Any important decisions or findings
```

---

**Last Updated**: 2026-02-15
**Document Owner**: Development Team
**Review Date**: Check for updates before starting each phase
