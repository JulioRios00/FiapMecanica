# 🚗 Automotive Workshop Management System

Integrated Service Management System for Automotive Workshop - MVP Back-end

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Features](#features)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Database](#database)
- [Security](#security)
- [Contributing](#contributing)

## 🎯 Overview

This project is the MVP (Minimum Viable Product) back-end for an automotive workshop management system. It enables workshops to manage customers, vehicles, services, parts inventory, and service orders efficiently.

### Key Benefits

- ✅ Organized service order management
- ✅ Real-time service tracking for customers
- ✅ Efficient parts and inventory control
- ✅ Complete customer and vehicle history
- ✅ Automated budget generation
- ✅ Digital approval flow

## 🏗️ Architecture

The project follows **Hexagonal Architecture** (Ports and Adapters) principles, ensuring:

- **Domain Independence**: Business logic isolated from external concerns
- **Testability**: Easy to test with mocked dependencies
- **Flexibility**: Easy to swap implementations (e.g., database, external services)
- **Maintainability**: Clear separation of concerns

### Architecture Layers

```
src/
├── domain/              # Business logic and entities (Core)
│   ├── entities/        # Domain entities
│   └── value-objects/   # Value objects (CPF, Email, etc.)
├── application/         # Use cases and ports (Application)
│   ├── ports/           # Repository interfaces
│   └── use-cases/       # Business use cases
├── infrastructure/      # External adapters (Infrastructure)
│   ├── database/        # Prisma client
│   ├── repositories/    # Repository implementations
│   └── auth/            # Authentication
├── presentation/        # API layer (Presentation)
│   ├── controllers/     # REST controllers
│   └── dtos/            # Data transfer objects
└── modules/             # NestJS modules
```

## 🛠️ Technologies

- **Node.js** 20+ - Runtime environment
- **NestJS** 10+ - Progressive Node.js framework
- **TypeScript** 5+ - Type-safe JavaScript
- **Prisma ORM** 5+ - Next-generation ORM
- **PostgreSQL** 16+ - Relational database
- **JWT** - Authentication
- **Swagger** - API documentation
- **Jest** - Testing framework
- **Docker** - Containerization

### Why PostgreSQL?

PostgreSQL was chosen for:
- ✅ ACID compliance for transactional integrity
- ✅ Advanced querying capabilities
- ✅ Strong data consistency
- ✅ Rich ecosystem and community support
- ✅ Excellent performance for complex queries
- ✅ Open-source and production-ready

## ✨ Features

### Customer Management
- CRUD operations for customers
- CPF/CNPJ validation
- Customer search and filtering
- Soft delete support

### Vehicle Management
- CRUD operations for vehicles
- License plate validation (Brazilian format)
- Vehicle history tracking
- Customer-vehicle relationship

### Service Catalog
- Service management
- Category classification
- Price and duration estimation
- Active/inactive status

### Parts & Inventory
- Parts catalog management
- Stock control
- Low stock alerts
- Stock movement history

### Service Orders (OS)
- Complete service order lifecycle
- Multiple status tracking:
  - Received
  - In Diagnosis
  - Awaiting Approval
  - Approved
  - In Progress
  - Awaiting Parts
  - Completed
  - Delivered
  - Cancelled
- Automatic budget generation
- Customer approval flow
- Service and parts association
- Status history tracking
- Average execution time monitoring

### Security
- JWT-based authentication
- Protected administrative endpoints
- Public endpoints for customer tracking
- Password encryption with bcrypt

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- Docker and Docker Compose installed
- Git

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd oficinaMecanicaProject
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL="postgresql://workshop:workshop123@localhost:5432/workshop_db?schema=public"

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=24h

API_PREFIX=api/v1
```

4. **Start the database with Docker**

```bash
docker-compose up -d postgres
```

5. **Run database migrations**

```bash
npm run prisma:generate
npm run prisma:migrate
```

6. **Start the application**

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### Using Docker Compose (Recommended)

Start the entire application stack (database + API):

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL database on port 5432
- Run migrations automatically
- Start the API on port 3000

### Accessing the Application

- **API Base URL**: http://localhost:3000/api/v1
- **Swagger Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/v1/health

## 📚 API Documentation

### Interactive Documentation

Access Swagger UI at: http://localhost:3000/api/docs

### Authentication

1. **Register a user**

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "admin@workshop.com",
  "password": "SecurePass123",
  "name": "Admin User"
}
```

2. **Login**

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@workshop.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@workshop.com",
    "name": "Admin User",
    "role": "EMPLOYEE"
  }
}
```

3. **Use the token**

Add to request headers:
```
Authorization: Bearer <access_token>
```

### Main Endpoints

#### Customers
- `POST /api/v1/customers` - Create customer
- `GET /api/v1/customers` - List customers
- `GET /api/v1/customers/:id` - Get customer by ID
- `PUT /api/v1/customers/:id` - Update customer
- `DELETE /api/v1/customers/:id` - Delete customer

#### Service Orders
- `POST /api/v1/service-orders` - Create service order
- `GET /api/v1/service-orders` - List service orders (public)
- `GET /api/v1/service-orders/:id` - Get service order (public)
- `PUT /api/v1/service-orders/:id/status` - Update status
- `POST /api/v1/service-orders/:id/approve` - Approve order (public)

### Example: Create Service Order

```bash
POST /api/v1/service-orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "uuid-customer",
  "vehicleId": "uuid-vehicle",
  "description": "Engine making strange noise and losing power",
  "priority": "HIGH",
  "services": [
    {
      "serviceId": "uuid-service-1",
      "quantity": 1
    }
  ],
  "parts": [
    {
      "partId": "uuid-part-1",
      "quantity": 2
    }
  ]
}
```

## 🧪 Testing

### Run Unit Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:cov
```

### Run E2E Tests

```bash
npm run test:e2e
```

### Coverage Requirements

The project aims for **80% minimum coverage** on critical domains:
- Domain entities
- Value objects
- Use cases
- Repository implementations

## 📁 Project Structure

```
oficinaMecanicaProject/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── application/           # Application layer
│   │   ├── ports/            # Repository interfaces
│   │   └── use-cases/        # Business use cases
│   ├── domain/               # Domain layer
│   │   ├── entities/         # Business entities
│   │   └── value-objects/    # Value objects
│   ├── infrastructure/       # Infrastructure layer
│   │   ├── auth/            # Authentication
│   │   ├── database/        # Prisma client
│   │   └── repositories/    # Repository implementations
│   ├── presentation/         # Presentation layer
│   │   ├── controllers/     # REST controllers
│   │   └── dtos/            # Data transfer objects
│   ├── modules/             # NestJS modules
│   ├── app.module.ts        # Root module
│   └── main.ts              # Application entry point
├── test/                     # E2E tests
├── docker-compose.yml        # Docker composition
├── Dockerfile               # Container definition
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── README.md                # This file
```

## 💾 Database

### Entity Relationship

```
Customer (1) ──── (*) Vehicle
    │                   │
    │                   │
    └─────── (*) ServiceOrder (*) ───────┐
                    │                     │
                    │                     │
                (*) ServiceOrderItem   (*) PartOrderItem
                    │                     │
                    │                     │
                Service                 Part
```

### Key Tables

- **customers**: Customer information
- **vehicles**: Vehicle registry
- **services**: Service catalog
- **parts**: Parts inventory
- **service_orders**: Service orders
- **service_order_items**: Services in order
- **part_order_items**: Parts in order
- **service_order_status_history**: Status tracking
- **users**: System users

### Migrations

Create a new migration:

```bash
npm run prisma:migrate -- --name migration_name
```

Apply migrations:

```bash
npm run prisma:migrate
```

Open Prisma Studio:

```bash
npm run prisma:studio
```

## 🔒 Security

### Implemented Security Measures

1. **Authentication**: JWT-based authentication
2. **Password Hashing**: bcrypt with salt rounds
3. **Input Validation**: class-validator for DTOs
4. **Document Validation**: CPF/CNPJ validation algorithms
5. **License Plate Validation**: Brazilian format validation
6. **Protected Endpoints**: JWT guard for admin operations
7. **Public Endpoints**: Service order tracking for customers

### Environment Variables

Never commit sensitive data:
- Keep `.env` file out of version control
- Use strong JWT secrets in production
- Rotate secrets regularly
- Use environment-specific configurations

## 🤝 Contributing

### Development Workflow

1. Create a feature branch
2. Implement changes
3. Write/update tests
4. Run linter: `npm run lint`
5. Run tests: `npm test`
6. Commit with descriptive messages
7. Create pull request

### Code Style

The project uses:
- **ESLint** for linting
- **Prettier** for formatting

Format code:

```bash
npm run format
```

Lint code:

```bash
npm run lint
```

## 📝 License

This project is part of FIAP Tech Challenge and is for educational purposes.

## 👥 Authors

FIAP Tech Challenge Team

## 📞 Support

For questions or issues, please open an issue in the repository.

---

**Built with ❤️ using NestJS and Hexagonal Architecture**

