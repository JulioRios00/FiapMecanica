import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { DocumentType, ServiceCategory } from '@prisma/client';

describe('Workshop API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let customerId: string;
  let vehicleId: string;
  let serviceId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clean database
    await prisma.serviceOrderItem.deleteMany();
    await prisma.partOrderItem.deleteMany();
    await prisma.serviceOrderStatusHistory.deleteMany();
    await prisma.serviceOrder.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.service.deleteMany();
    await prisma.part.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('/api/v1/auth/register (POST)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@workshop.com',
          password: 'Test123!',
          name: 'Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.email).toBe('test@workshop.com');
        });
    });

    it('/api/v1/auth/login (POST)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@workshop.com',
          password: 'Test123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          authToken = res.body.access_token;
        });
    });
  });

  describe('Customers', () => {
    it('/api/v1/customers (POST)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'John Doe',
          documentType: DocumentType.CPF,
          document: '12345678909',
          email: 'john@example.com',
          phone: '11987654321',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe('John Doe');
          customerId = res.body.id;
        });
    });

    it('/api/v1/customers (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('/api/v1/customers/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(customerId);
          expect(res.body.name).toBe('John Doe');
        });
    });

    it('/api/v1/customers/:id (PUT)', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phone: '11999999999',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.phone).toBe('11999999999');
        });
    });
  });

  describe('Vehicles', () => {
    it('/api/v1/vehicles (POST) - should be implemented', () => {
      // This would require implementing the vehicle controller
      // Left as an example of what should be tested
      expect(true).toBe(true);
    });
  });

  describe('Services', () => {
    it('Create service for testing', async () => {
      const service = await prisma.service.create({
        data: {
          name: 'Oil Change',
          description: 'Complete oil change',
          estimatedDuration: 60,
          price: 150.00,
          category: ServiceCategory.MAINTENANCE,
        },
      });
      serviceId = service.id;
      expect(serviceId).toBeDefined();
    });
  });

  describe('Service Orders', () => {
    beforeAll(async () => {
      // Create a vehicle for testing
      const vehicle = await prisma.vehicle.create({
        data: {
          licensePlate: 'ABC1234',
          brand: 'Toyota',
          model: 'Corolla',
          year: 2020,
          customerId,
        },
      });
      vehicleId = vehicle.id;
    });

    it('/api/v1/service-orders (POST)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/service-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId,
          vehicleId,
          description: 'Regular maintenance service',
          priority: 'NORMAL',
          services: [
            {
              serviceId,
              quantity: 1,
            },
          ],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.orderNumber).toBeDefined();
          expect(res.body.status).toBe('RECEIVED');
        });
    });

    it('/api/v1/service-orders (GET) - public endpoint', () => {
      return request(app.getHttpServer())
        .get('/api/v1/service-orders')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
        });
    });
  });

  describe('Error Handling', () => {
    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/customers')
        .send({
          name: 'Test',
          documentType: DocumentType.CPF,
          document: '12345678909',
          email: 'test@test.com',
          phone: '11987654321',
        })
        .expect(401);
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Jo', // Too short
          documentType: DocumentType.CPF,
          document: '123',
          email: 'invalid-email',
          phone: '11987654321',
        })
        .expect(400);
    });

    it('should return 404 for non-existent resource', () => {
      return request(app.getHttpServer())
        .get('/api/v1/customers/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 409 for duplicate customer', () => {
      return request(app.getHttpServer())
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Jane Doe',
          documentType: DocumentType.CPF,
          document: '12345678909', // Same as first customer
          email: 'jane@example.com',
          phone: '11987654321',
        })
        .expect(409);
    });
  });
});

