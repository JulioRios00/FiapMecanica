export interface SendStatusUpdateEmailInput {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  previousStatus?: string;
  newStatus: string;
  reason?: string;
}

export abstract class EmailServicePort {
  abstract sendStatusUpdateEmail(input: SendStatusUpdateEmailInput): Promise<void>;
}
