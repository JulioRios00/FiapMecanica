import { ServiceOrderStatus } from '@prisma/client';

export const STATUS_PRIORITY_MAP: Record<ServiceOrderStatus, number> = {
  [ServiceOrderStatus.IN_PROGRESS]: 1,
  [ServiceOrderStatus.AWAITING_APPROVAL]: 2,
  [ServiceOrderStatus.IN_DIAGNOSIS]: 3,
  [ServiceOrderStatus.RECEIVED]: 4,
  [ServiceOrderStatus.APPROVED]: 5,
  [ServiceOrderStatus.AWAITING_PARTS]: 6,
  [ServiceOrderStatus.CANCELLED]: 7,
  [ServiceOrderStatus.COMPLETED]: 99,
  [ServiceOrderStatus.DELIVERED]: 99,
};

export function getStatusPriority(status: ServiceOrderStatus): number {
  return STATUS_PRIORITY_MAP[status] ?? 999;
}

export function compareByPriority(
  a: { status: ServiceOrderStatus; createdAt?: Date },
  b: { status: ServiceOrderStatus; createdAt?: Date },
): number {
  const priorityA = getStatusPriority(a.status);
  const priorityB = getStatusPriority(b.status);

  if (priorityA !== priorityB) {
    return priorityA - priorityB;
  }

  const dateA = a.createdAt?.getTime() ?? 0;
  const dateB = b.createdAt?.getTime() ?? 0;
  return dateA - dateB;
}
