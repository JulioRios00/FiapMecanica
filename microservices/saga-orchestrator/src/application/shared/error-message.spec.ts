import { errorMessage } from './error-message';

describe('errorMessage', () => {
  it('returns the message of a regular Error', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom');
  });

  it('falls back to the aggregated sub-error messages when message is empty', () => {
    const aggregate = new AggregateError([new Error('ECONNREFUSED'), new Error('ENOTFOUND')], '');
    expect(errorMessage(aggregate)).toBe('ECONNREFUSED; ENOTFOUND');
  });

  it('falls back to the error name when there is no message and no sub-errors', () => {
    const error = new Error('');
    error.name = 'WeirdError';
    expect(errorMessage(error)).toBe('WeirdError');
  });

  it('stringifies non-Error values', () => {
    expect(errorMessage('just a string')).toBe('just a string');
  });
});
