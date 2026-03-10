import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { DocumentType, ServiceCategory } from '@prisma/client';

// nosemgrep: generic-test-password — dummy credential for test DB only, not a real secret
const TEST_PASSWORD = 'E2eTest@local1';

describe('Workshop API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let customerId: string;
  let vehicleId: string;
  let serviceId: string;
  let partId: string;
  let serviceOrderId: string;

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
          password: TEST_PASSWORD,
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
          password: TEST_PASSWORD,
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
    it('/api/v1/vehicles (POST)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          licensePlate: 'XYZ5678',
          brand: 'Honda',
          model: 'Civic',
          year: 2023,
          customerId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.licensePlate).toBe('XYZ5678');
          vehicleId = res.body.id;
        });
    });

    it('/api/v1/vehicles (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('/api/v1/vehicles/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(vehicleId);
          expect(res.body.licensePlate).toBe('XYZ5678');
        });
    });

    it('/api/v1/vehicles/:id (PUT)', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          brand: 'Honda',
          model: 'Civic EX',
          year: 2024,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.model).toBe('Civic EX');
          expect(res.body.year).toBe(2024);
        });
    });
  });

  describe('Services', () => {
    it('/api/v1/services (POST)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Oil Change',
          description: 'Complete oil change',
          estimatedDuration: 60,
          price: 150.0,
          category: ServiceCategory.MAINTENANCE,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe('Oil Change');
          serviceId = res.body.id;
        });
    });

    it('/api/v1/services (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/services')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('/api/v1/services/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/services/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(serviceId);
          expect(res.body.name).toBe('Oil Change');
        });
    });

    it('/api/v1/services/:id (PUT)', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/services/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          price: 180.0,
          estimatedDuration: 45,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.price).toBe(180);
        });
    });
  });

  describe('Parts', () => {
    it('/api/v1/parts (POST)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/parts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Oil Filter',
          partNumber: 'OF-12345',
          price: 45.5,
          stockQuantity: 100,
          minStockLevel: 10,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe('Oil Filter');
          partId = res.body.id;
        });
    });

    it('/api/v1/parts (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/parts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('/api/v1/parts/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/parts/${partId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(partId);
          expect(res.body.name).toBe('Oil Filter');
        });
    });

    it('/api/v1/parts/:id (PUT)', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/parts/${partId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          price: 50.0,
          stockQuantity: 120,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.price).toBe(50);
          expect(res.body.stockQuantity).toBe(120);
        });
    });
  });

  describe('Service Orders', () => {
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
          parts: [
            {
              partId,
              quantity: 2,
            },
          ],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.orderNumber).toBeDefined();
          expect(res.body.status).toBe('RECEIVED');
          serviceOrderId = res.body.id;
        });
    });

    it('/api/v1/service-orders (GET) - public endpoint', () => {
      return request(app.getHttpServer())
        .get('/api/v1/service-orders')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('/api/v1/service-orders/:id (GET) - public endpoint', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/service-orders/${serviceOrderId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(serviceOrderId);
          expect(res.body.status).toBe('RECEIVED');
        });
    });

    it('/api/v1/service-orders/:id/status (PUT)', async () => {
      await request(app.getHttpServer())
        .put(`/api/v1/service-orders/${serviceOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'IN_DIAGNOSIS', reason: 'Starting vehicle diagnosis' })
        .expect(200);

      const res = await request(app.getHttpServer())
        .put(`/api/v1/service-orders/${serviceOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'AWAITING_APPROVAL', reason: 'Diagnosis complete' })
        .expect(200);

      expect(res.body.status).toBe('AWAITING_APPROVAL');
    });

    it('/api/v1/service-orders/:id/approve (POST) - public endpoint', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/service-orders/${serviceOrderId}/approve`)
        .send({
          approvedBy: customerId,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('APPROVED');
        });
    });

    it('/api/v1/service-orders/metrics/execution (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/service-orders/metrics/execution')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.totalServiceOrders).toBeDefined();
          expect(res.body.averageExecutionTimeInHours).toBeDefined();
        });
    });
  });

  describe('Cleanup - Soft Deletes', () => {
    it('/api/v1/parts/:id (DELETE)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/parts/${partId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('/api/v1/services/:id (DELETE)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/services/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('/api/v1/vehicles/:id (DELETE)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('/api/v1/customers/:id (DELETE)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
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
        .get('/api/v1/customers/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid license plate format', () => {
      return request(app.getHttpServer())
        .post('/api/v1/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          licensePlate: 'INVALID',
          brand: 'Test',
          model: 'Test',
          year: 2023,
          customerId,
        })
        .expect(400);
    });

    it('should return 400 for invalid service category', () => {
      return request(app.getHttpServer())
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Service',
          estimatedDuration: 30,
          price: 100,
          category: 'INVALID_CATEGORY',
        })
        .expect(400);
    });
  });
});
