import { PrismaClient, DocumentType, ServiceCategory, Priority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create users
  console.log('👤 Creating users...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@workshop.com' },
    update: {},
    create: {
      email: 'admin@workshop.com',
      password: await bcrypt.hash('Admin123!', 10),
      name: 'Workshop Admin',
      role: 'ADMIN',
    },
  });

  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@workshop.com' },
    update: {},
    create: {
      email: 'employee@workshop.com',
      password: await bcrypt.hash('Employee123!', 10),
      name: 'Workshop Employee',
      role: 'EMPLOYEE',
    },
  });

  console.log(`✅ Created users: ${adminUser.email}, ${employeeUser.email}`);

  // Create customers
  console.log('👥 Creating customers...');
  const customer1 = await prisma.customer.upsert({
    where: { document: '12345678909' },
    update: {},
    create: {
      name: 'João Silva',
      documentType: DocumentType.CPF,
      document: '12345678909',
      email: 'joao.silva@email.com',
      phone: '11987654321',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234567',
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { document: '98765432100' },
    update: {},
    create: {
      name: 'Maria Santos',
      documentType: DocumentType.CPF,
      document: '98765432100',
      email: 'maria.santos@email.com',
      phone: '11912345678',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310100',
    },
  });

  console.log(`✅ Created customers: ${customer1.name}, ${customer2.name}`);

  // Create vehicles
  console.log('🚗 Creating vehicles...');
  const vehicle1 = await prisma.vehicle.upsert({
    where: { licensePlate: 'ABC1234' },
    update: {},
    create: {
      licensePlate: 'ABC1234',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      color: 'Silver',
      customerId: customer1.id,
    },
  });

  const vehicle2 = await prisma.vehicle.upsert({
    where: { licensePlate: 'XYZ5678' },
    update: {},
    create: {
      licensePlate: 'XYZ5678',
      brand: 'Honda',
      model: 'Civic',
      year: 2021,
      color: 'Black',
      customerId: customer2.id,
    },
  });

  console.log(`✅ Created vehicles: ${vehicle1.licensePlate}, ${vehicle2.licensePlate}`);

  // Create services
  console.log('🔧 Creating services...');
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: 'service-oil-change' },
      update: {},
      create: {
        id: 'service-oil-change',
        name: 'Oil Change',
        description: 'Complete oil and filter change',
        estimatedDuration: 60,
        price: 150.00,
        category: ServiceCategory.MAINTENANCE,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-brake-inspection' },
      update: {},
      create: {
        id: 'service-brake-inspection',
        name: 'Brake Inspection',
        description: 'Complete brake system inspection',
        estimatedDuration: 45,
        price: 80.00,
        category: ServiceCategory.INSPECTION,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-alignment' },
      update: {},
      create: {
        id: 'service-alignment',
        name: 'Wheel Alignment',
        description: 'Front and rear wheel alignment',
        estimatedDuration: 90,
        price: 120.00,
        category: ServiceCategory.ALIGNMENT,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-diagnostics' },
      update: {},
      create: {
        id: 'service-diagnostics',
        name: 'Engine Diagnostics',
        description: 'Computer diagnostics for engine issues',
        estimatedDuration: 120,
        price: 200.00,
        category: ServiceCategory.DIAGNOSTICS,
      },
    }),
  ]);

  console.log(`✅ Created ${services.length} services`);

  // Create parts
  console.log('🔩 Creating parts...');
  const parts = await Promise.all([
    prisma.part.upsert({
      where: { partNumber: 'OF-001' },
      update: {},
      create: {
        name: 'Oil Filter',
        description: 'High-quality oil filter',
        partNumber: 'OF-001',
        manufacturer: 'Bosch',
        price: 45.00,
        stockQuantity: 50,
        minStockLevel: 10,
        unit: 'un',
      },
    }),
    prisma.part.upsert({
      where: { partNumber: 'BP-001' },
      update: {},
      create: {
        name: 'Brake Pad Set',
        description: 'Front brake pad set',
        partNumber: 'BP-001',
        manufacturer: 'Brembo',
        price: 180.00,
        stockQuantity: 30,
        minStockLevel: 5,
        unit: 'set',
      },
    }),
    prisma.part.upsert({
      where: { partNumber: 'AF-001' },
      update: {},
      create: {
        name: 'Air Filter',
        description: 'Engine air filter',
        partNumber: 'AF-001',
        manufacturer: 'Mann',
        price: 35.00,
        stockQuantity: 40,
        minStockLevel: 10,
        unit: 'un',
      },
    }),
    prisma.part.upsert({
      where: { partNumber: 'SP-001' },
      update: {},
      create: {
        name: 'Spark Plug Set',
        description: 'Set of 4 spark plugs',
        partNumber: 'SP-001',
        manufacturer: 'NGK',
        price: 120.00,
        stockQuantity: 25,
        minStockLevel: 5,
        unit: 'set',
      },
    }),
  ]);

  console.log(`✅ Created ${parts.length} parts`);

  // Create sample service orders
  console.log('📋 Creating service orders...');
  const order1 = await prisma.serviceOrder.create({
    data: {
      orderNumber: 'OS000001',
      customerId: customer1.id,
      vehicleId: vehicle1.id,
      description: 'Regular maintenance - oil change and inspection',
      status: 'RECEIVED',
      priority: Priority.NORMAL,
      totalAmount: 195.00,
      createdBy: employeeUser.id,
      serviceItems: {
        create: [
          {
            serviceId: services[0].id,
            quantity: 1,
            unitPrice: 150.00,
            totalPrice: 150.00,
            status: 'PENDING',
          },
        ],
      },
      partItems: {
        create: [
          {
            partId: parts[0].id,
            quantity: 1,
            unitPrice: 45.00,
            totalPrice: 45.00,
            status: 'PENDING',
          },
        ],
      },
      statusHistory: {
        create: {
          newStatus: 'RECEIVED',
          changedBy: employeeUser.id,
        },
      },
    },
  });

  const order2 = await prisma.serviceOrder.create({
    data: {
      orderNumber: 'OS000002',
      customerId: customer2.id,
      vehicleId: vehicle2.id,
      description: 'Brake system making noise - needs inspection',
      status: 'IN_DIAGNOSIS',
      priority: Priority.HIGH,
      totalAmount: 80.00,
      createdBy: employeeUser.id,
      assignedTo: employeeUser.id,
      serviceItems: {
        create: [
          {
            serviceId: services[1].id,
            quantity: 1,
            unitPrice: 80.00,
            totalPrice: 80.00,
            status: 'IN_PROGRESS',
          },
        ],
      },
      statusHistory: {
        create: [
          {
            newStatus: 'RECEIVED',
            changedBy: employeeUser.id,
          },
          {
            previousStatus: 'RECEIVED',
            newStatus: 'IN_DIAGNOSIS',
            changedBy: employeeUser.id,
          },
        ],
      },
    },
  });

  console.log(`✅ Created service orders: ${order1.orderNumber}, ${order2.orderNumber}`);

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

