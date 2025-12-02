import { Module } from '@nestjs/common';
import { CustomerController } from '@presentation/controllers/customer.controller';
import { CreateCustomerUseCase } from '@application/use-cases/customer/create-customer.use-case';
import { UpdateCustomerUseCase } from '@application/use-cases/customer/update-customer.use-case';
import { GetCustomerUseCase } from '@application/use-cases/customer/get-customer.use-case';
import { ListCustomersUseCase } from '@application/use-cases/customer/list-customers.use-case';
import { DeleteCustomerUseCase } from '@application/use-cases/customer/delete-customer.use-case';
import { CustomerRepository } from '@infrastructure/repositories/customer.repository';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';
import { PrismaService } from '@infrastructure/database/prisma.service';

@Module({
  controllers: [CustomerController],
  providers: [
    PrismaService,
    {
      provide: CustomerRepositoryPort,
      useClass: CustomerRepository,
    },
    CreateCustomerUseCase,
    UpdateCustomerUseCase,
    GetCustomerUseCase,
    ListCustomersUseCase,
    DeleteCustomerUseCase,
  ],
  exports: [CustomerRepositoryPort],
})
export class CustomerModule {}

