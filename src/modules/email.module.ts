import { Module } from '@nestjs/common';
import { EmailServicePort } from '@application/ports/email.service.port';
import { EmailService } from '@infrastructure/services/email.service';

@Module({
  providers: [
    {
      provide: EmailServicePort,
      useClass: EmailService,
    },
  ],
  exports: [EmailServicePort],
})
export class EmailModule {}
