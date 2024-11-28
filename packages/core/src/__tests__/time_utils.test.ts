import { TimeUtils } from '../TimeUtils'; // Adjust the import path as needed

describe('TimeUtils', () => {
  
  // Testing the timeout function
  describe('timeout', () => {
    it('should resolve after the specified timeout', async () => {
      const start = Date.now();
      await TimeUtils.timeout(500);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(500);
    });

    it('should resolve immediately when 0ms is passed', async () => {
      const start = Date.now();
      await TimeUtils.timeout(0);
      const end = Date.now();
      expect(end - start).toBeLessThan(10); // Ensure the timeout happens instantly
    });
  });

  // Testing the sleep function
  describe('sleep', () => {
    it('should delay the function execution by 3 seconds', async () => {
      const mockFn = jest.fn();
      const start = Date.now();

      await TimeUtils.sleep(mockFn);

      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(3000);
      expect(mockFn).toHaveBeenCalled();
    });

    it('should pass arguments to the function', async () => {
      const mockFn = jest.fn();
      const args = [1, 2, 3];

      await TimeUtils.sleep(mockFn, ...args);

      expect(mockFn).toHaveBeenCalledWith(...args);
    });
  });

  // Testing the debounce function
  describe('debounce', () => {
    it('should delay function calls', () => {
      jest.useFakeTimers(); // Use fake timers to control setTimeout

      const mockFn = jest.fn();
      const debounced = TimeUtils.debounce(mockFn, 1000);

      debounced();
      debounced();
      debounced();

      // The function should only be called once after 1 second
      jest.advanceTimersByTime(1000);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  // Testing the throttle function
  describe('throttle', () => {
    it('should limit the function calls to once every wait time', () => {
      jest.useFakeTimers();

      const mockFn = jest.fn();
      const throttled = TimeUtils.throttle(mockFn, 1000);

      throttled();
      throttled();
      throttled();

      // The function should only be called once
      jest.advanceTimersByTime(1000);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  // Testing the formatDuration function
  describe('formatDuration', () => {
    it('should format milliseconds to hh:mm:ss', () => {
      expect(TimeUtils.formatDuration(3661000)).toBe('01:01:01'); // 1 hour, 1 minute, 1 second
      expect(TimeUtils.formatDuration(60000)).toBe('00:01:00');  // 1 minute
      expect(TimeUtils.formatDuration(5000)).toBe('00:00:05');   // 5 seconds
      expect(TimeUtils.formatDuration(0)).toBe('00:00:00');      // 0 ms
    });
  });
});
