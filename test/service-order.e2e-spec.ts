import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { DocumentType, ServiceCategory } from '@prisma/client';

describe('Service Orders - Priority Sorting & Health (e2e)', () => {
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

    await prisma.serviceOrderItem.deleteMany();
    await prisma.partOrderItem.deleteMany();
    await prisma.serviceOrderStatusHistory.deleteMany();
    await prisma.serviceOrder.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.service.deleteMany();
    await prisma.part.deleteMany();
    await prisma.user.deleteMany();

    // nosemgrep: generic-test-password — dummy credential for test DB only, not a real secret
    const testPassword = 'E2eTest@local1';

    // Register and login
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'so-test@workshop.com', password: testPassword, name: 'SO Tester' });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'so-test@workshop.com', password: testPassword });
    authToken = loginRes.body.access_token;

    // Create customer
    const customerRes = await request(app.getHttpServer())
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Priority Test Customer',
        documentType: DocumentType.CPF,
        document: '98765432100',
        email: 'priority@example.com',
        phone: '11911111111',
      });
    customerId = customerRes.body.id;

    // Create vehicle
    const vehicleRes = await request(app.getHttpServer())
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        licensePlate: 'PRI1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2022,
        customerId,
      });
    vehicleId = vehicleRes.body.id;

    // Create service
    const serviceRes = await request(app.getHttpServer())
      .post('/api/v1/services')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Priority Test Service',
        description: 'Test service for priority sorting',
        estimatedDuration: 30,
        price: 100.0,
        category: ServiceCategory.MAINTENANCE,
      });
    serviceId = serviceRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/api/v1/health (GET) - should return healthy status', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.database).toBe('connected');
    });
  });

  describe('Priority-Based Sorting', () => {
    let orderInDiagnosis: string;
    let orderInProgress: string;

    beforeAll(async () => {
      const createOrder = async () => {
        const res = await request(app.getHttpServer())
          .post('/api/v1/service-orders')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            customerId,
            vehicleId,
            description: 'Priority test order',
            services: [{ serviceId, quantity: 1 }],
            parts: [],
          });
        return res.body.id;
      };

      const advanceStatus = async (id: string, status: string) => {
        await request(app.getHttpServer())
          .put(`/api/v1/service-orders/${id}/status`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ status, reason: 'Test advance' });
      };

      // Create 3 orders and advance them to different statuses
      await createOrder(); // RECEIVED status — used to verify sort order

      orderInDiagnosis = await createOrder();
      await advanceStatus(orderInDiagnosis, 'IN_DIAGNOSIS');

      orderInProgress = await createOrder();
      await advanceStatus(orderInProgress, 'IN_DIAGNOSIS');
      await request(app.getHttpServer())
        .post(`/api/v1/service-orders/${orderInProgress}/approve`)
        .send({ approvedBy: customerId });
      await advanceStatus(orderInProgress, 'IN_PROGRESS');
    });

    it('should return orders sorted by priority (IN_PROGRESS first)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/service-orders?sortByPriority=true')
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);

      const statuses = res.body.data.map((o: any) => o.status);
      const inProgressIdx = statuses.indexOf('IN_PROGRESS');
      const inDiagnosisIdx = statuses.indexOf('IN_DIAGNOSIS');
      const receivedIdx = statuses.indexOf('RECEIVED');

      expect(inProgressIdx).toBeLessThan(inDiagnosisIdx);
      expect(inDiagnosisIdx).toBeLessThan(receivedIdx);
    });

    it('should exclude completed orders by default', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/service-orders').expect(200);

      const statuses = res.body.data.map((o: any) => o.status);
      expect(statuses).not.toContain('COMPLETED');
      expect(statuses).not.toContain('DELIVERED');
    });

    it('should include completed orders when excludeCompleted=false', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/service-orders?excludeCompleted=false')
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should filter orders by status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/service-orders?status=RECEIVED')
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      res.body.data.forEach((order: any) => {
        expect(order.status).toBe('RECEIVED');
      });
    });
  });

  describe('Email Notification on Status Update', () => {
    let testOrderId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/service-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId,
          vehicleId,
          description: 'Email notification test order',
          services: [{ serviceId, quantity: 1 }],
          parts: [],
        });
      testOrderId = res.body.id;
    });

    it('should update status and trigger email notification without failing', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/service-orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'IN_DIAGNOSIS', reason: 'Starting diagnosis' })
        .expect(200);

      expect(res.body.status).toBe('IN_DIAGNOSIS');
    });
  });
});
