import { vi, describe, it, expect, beforeEach } from 'vitest';
import { RetryManager } from '../retry-utils';

describe('RetryManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('succeeds on first attempt', async () => {
    const operation = vi.fn().mockResolvedValue('success');
    
    const result = await RetryManager.withRetry(operation);
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and eventually succeeds', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('NetworkError'))
      .mockRejectedValueOnce(new Error('NetworkError'))
      .mockResolvedValue('success');
    
    const result = await RetryManager.withRetry(operation, {
      maxAttempts: 3,
      delay: 10, // Short delay for testing
    });
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('throws error after max attempts', async () => {
    const error = new Error('NetworkError');
    const operation = vi.fn().mockRejectedValue(error);
    
    await expect(
      RetryManager.withRetry(operation, {
        maxAttempts: 2,
        delay: 10,
      })
    ).rejects.toThrow('NetworkError');
    
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('calls onRetry callback', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('NetworkError'))
      .mockResolvedValue('success');
    
    const onRetry = vi.fn();
    
    await RetryManager.withRetry(operation, {
      maxAttempts: 2,
      delay: 10,
      onRetry,
    });
    
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
  });

  it('identifies retryable errors correctly', () => {
    expect(RetryManager.isRetryableError(new Error('NetworkError'))).toBe(true);
    expect(RetryManager.isRetryableError(new Error('fetch failed'))).toBe(true);
    expect(RetryManager.isRetryableError(new Error('timeout'))).toBe(true);
    expect(RetryManager.isRetryableError(new Error('HTTP 500'))).toBe(true);
    expect(RetryManager.isRetryableError(new Error('HTTP 429'))).toBe(true);
    expect(RetryManager.isRetryableError(new Error('Validation error'))).toBe(false);
  });

  it('does not retry non-retryable errors', async () => {
    const error = new Error('Validation error');
    const operation = vi.fn().mockRejectedValue(error);
    
    await expect(
      RetryManager.withRetry(operation, {
        maxAttempts: 3,
        shouldRetry: (err) => RetryManager.isRetryableError(err),
      })
    ).rejects.toThrow('Validation error');
    
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('uses exponential backoff', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('NetworkError'))
      .mockRejectedValueOnce(new Error('NetworkError'))
      .mockResolvedValue('success');
    
    const startTime = Date.now();
    
    await RetryManager.withRetry(operation, {
      maxAttempts: 3,
      delay: 50, // Reduced delay for faster tests
      backoff: 'exponential',
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should take at least 50ms (first retry) + 100ms (second retry) = 150ms
    expect(duration).toBeGreaterThan(100);
  });

  it('retryFetch works correctly', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ data: 'test' }) };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);
    
    const response = await RetryManager.retryFetch('/api/test');
    
    expect(response).toBe(mockResponse);
    expect(fetch).toHaveBeenCalledWith('/api/test', undefined);
  });

  it('retryFetch throws on non-ok response', async () => {
    const mockResponse = { ok: false, status: 500, statusText: 'Internal Server Error' };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);
    
    await expect(
      RetryManager.retryFetch('/api/test', undefined, { maxAttempts: 1 })
    ).rejects.toThrow('HTTP 500: Internal Server Error');
  });
});