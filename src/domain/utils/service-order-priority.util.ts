import { ServiceOrderStatus } from '@prisma/client';

/**
 * Priority weights for service order sorting
 * Lower number = higher priority (sorted first)
 */
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

/**
 * Get priority weight for a given status
 * @param status ServiceOrderStatus
 * @returns Priority weight (lower = higher priority)
 */
export function getStatusPriority(status: ServiceOrderStatus): number {
  return STATUS_PRIORITY_MAP[status] ?? 999;
}

/**
 * Compare two service orders by priority and creation date
 * Higher priority (lower weight) comes first
 * Within same priority, older orders come first
 */
export function compareByPriority(
  a: { status: ServiceOrderStatus; createdAt?: Date },
  b: { status: ServiceOrderStatus; createdAt?: Date },
): number {
  const priorityA = getStatusPriority(a.status);
  const priorityB = getStatusPriority(b.status);

  // First, sort by priority (lower weight = higher priority)
  if (priorityA !== priorityB) {
    return priorityA - priorityB;
  }

  // Within same priority, sort by creation date (oldest first)
  const dateA = a.createdAt?.getTime() ?? 0;
  const dateB = b.createdAt?.getTime() ?? 0;
  return dateA - dateB;
}
