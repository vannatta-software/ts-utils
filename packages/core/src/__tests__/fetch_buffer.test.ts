import { FetchBuffer } from '../FetchBuffer';

jest.useFakeTimers();

describe('FetchBuffer', () => {
  test('should allow an attempt when canAttempt is true', () => {
    const buffer = new FetchBuffer(100);
    const callback = jest.fn();

    expect(buffer.canAttempt).toBe(true);

    buffer.attempt(callback);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(buffer.canAttempt).toBe(false);

    jest.advanceTimersByTime(100);
    expect(buffer.canAttempt).toBe(true);
  });

  test('should not call the callback if canAttempt is false', () => {
    const buffer = new FetchBuffer(100);
    const callback = jest.fn();

    buffer.attempt(callback);
    buffer.attempt(callback);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should reset canAttempt when cancel is called', () => {
    const buffer = new FetchBuffer(100);
    const callback = jest.fn();

    buffer.attempt(callback);
    expect(buffer.canAttempt).toBe(false);

    buffer.cancel();
    expect(buffer.canAttempt).toBe(true);

    jest.advanceTimersByTime(100);
    expect(buffer.canAttempt).toBe(true);
  });

  test('should dynamically update wait time with setWaitTime', () => {
    const buffer = new FetchBuffer(100);
    const callback = jest.fn();

    buffer.setWaitTime(200);
    buffer.attempt(callback);
    expect(buffer.canAttempt).toBe(false);

    jest.advanceTimersByTime(100);
    expect(buffer.canAttempt).toBe(false);

    jest.advanceTimersByTime(100);
    expect(buffer.canAttempt).toBe(true);
  });

  test('should throw an error if callback is not a function', () => {
    const buffer = new FetchBuffer(100);

    expect(() => buffer.attempt(undefined as unknown as () => void)).toThrow(
      'Callback must be a function.'
    );
  });

  test('should throw an error if wait time is set to 0 or less', () => {
    const buffer = new FetchBuffer(100);

    expect(() => buffer.setWaitTime(0)).toThrow('Wait time must be greater than 0.');
    expect(() => buffer.setWaitTime(-1)).toThrow('Wait time must be greater than 0.');
  });
});
