import { ServiceOrderRepositoryPort } from '../ports/service-order-repository.port';
import { ListServiceOrderHistoryUseCase } from './list-service-order-history.use-case';

describe('ListServiceOrderHistoryUseCase', () => {
  let repository: jest.Mocked<ServiceOrderRepositoryPort>;
  let useCase: ListServiceOrderHistoryUseCase;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      listHistory: jest.fn(),
    };
    useCase = new ListServiceOrderHistoryUseCase(repository);
  });

  it('delegates to the repository and returns the history entries', async () => {
    const history = [
      { newStatus: 'OPEN' as const, createdAt: new Date('2026-01-01T00:00:00.000Z') },
      {
        previousStatus: 'OPEN' as const,
        newStatus: 'AWAITING_QUOTE' as const,
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
      },
    ];
    repository.listHistory.mockResolvedValue(history);

    const result = await useCase.execute('os-1');

    expect(repository.listHistory).toHaveBeenCalledWith('os-1');
    expect(result).toBe(history);
  });
});
