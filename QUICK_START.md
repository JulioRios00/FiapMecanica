# 🚀 Quick Start Guide

Get the Automotive Workshop Management System running in 5 minutes!

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)
- Git

## Method 1: Docker Compose (Recommended for Testing)

The fastest way to run the entire application stack:

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd oficinaMecanicaProject
```

### 2. Start Everything

```bash
docker-compose up -d
```

This command will:
- ✅ Start PostgreSQL database
- ✅ Run database migrations automatically
- ✅ Start the API server
- ✅ Expose API on http://localhost:3000

### 3. Check if it's running

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f app
```

### 4. Access the Application

- **API**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs
- **Database**: localhost:5432 (user: workshop, password: workshop123, db: workshop_db)

### 5. Stop Everything

```bash
docker-compose down
```

To also remove volumes (database data):

```bash
docker-compose down -v
```

---

## Method 2: Local Development

For active development with hot-reload:

### 1. Clone and Install

```bash
git clone <repository-url>
cd oficinaMecanicaProject
npm install
```

### 2. Start Database Only

```bash
docker-compose up -d postgres
```

### 3. Setup Environment

The `.env` file is already configured. Check it:

```bash
cat .env
```

### 4. Run Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Seed Database (Optional)

Add sample data:

```bash
npm run prisma:seed
```

This will create:
- 2 users (admin and employee)
- 2 customers
- 2 vehicles
- 4 services
- 4 parts
- 2 sample service orders

### 6. Start Development Server

```bash
npm run start:dev
```

The API will be available at http://localhost:3000/api/v1

---

## First API Calls

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@workshop.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@workshop.com",
    "password": "Test123!"
  }'
```

Save the `access_token` from the response!

### 3. Create a Customer (Authenticated)

```bash
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "John Doe",
    "documentType": "CPF",
    "document": "12345678909",
    "email": "john@example.com",
    "phone": "11987654321"
  }'
```

### 4. List Service Orders (Public Endpoint)

```bash
curl http://localhost:3000/api/v1/service-orders
```

---

## Using Swagger UI

The easiest way to explore the API:

1. Open http://localhost:3000/api/docs
2. Click on "Authorize" button (🔒)
3. Login via `/auth/login` endpoint
4. Copy the `access_token`
5. Paste in the Authorization popup: `Bearer <your-token>`
6. Try any endpoint!

---

## Sample Users (After Seed)

If you ran the seed script, use these credentials:

**Admin User:**
- Email: `admin@workshop.com`
- Password: `Admin123!`

**Employee User:**
- Email: `employee@workshop.com`
- Password: `Employee123!`

---

## Troubleshooting

### Port 3000 already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

Or change the port in `.env`:

```env
PORT=3001
```

### Database connection errors

Make sure PostgreSQL is running:

```bash
docker-compose ps postgres
```

If not running:

```bash
docker-compose up -d postgres
```

### Reset Database

```bash
docker-compose down -v
docker-compose up -d postgres
npm run prisma:migrate
npm run prisma:seed
```

---

## Next Steps

1. ✅ Explore the API using Swagger
2. ✅ Check the [README.md](README.md) for detailed documentation
3. ✅ Review the architecture in `src/` directory
4. ✅ Run tests: `npm test`
5. ✅ Check test coverage: `npm run test:cov`

---

## Common Commands

```bash
# Development
npm run start:dev              # Start with hot-reload
npm run build                  # Build for production
npm run start:prod             # Start production build

# Database
npm run prisma:generate        # Generate Prisma Client
npm run prisma:migrate         # Run migrations
npm run prisma:studio          # Open Prisma Studio
npm run prisma:seed            # Seed database

# Testing
npm test                       # Run unit tests
npm run test:cov               # Run with coverage
npm run test:e2e               # Run e2e tests

# Code Quality
npm run lint                   # Lint code
npm run format                 # Format code

# Docker
docker-compose up -d           # Start all services
docker-compose down            # Stop all services
docker-compose logs -f app     # View logs
docker-compose ps              # Check status
```

---

## 🎉 You're All Set!

Start building amazing features for the automotive workshop!

Need help? Check the [README.md](README.md) or open an issue.

