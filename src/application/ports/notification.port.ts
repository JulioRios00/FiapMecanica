export abstract class NotificationPort {
  abstract sendStatusUpdateNotification(params: {
    serviceOrderId: string;
    newStatus: string;
    senderEmail: string;
    message?: string;
  }): Promise<void>;
}
