import { UpdateHandler } from '../UpdateHandler';

describe('UpdateHandler', () => {
  let updateHandler: UpdateHandler<string>;
  let mockOnUpdate: jest.Mock;
  let initialTimeout: number;

  beforeEach(() => {
    initialTimeout = 1000;
    mockOnUpdate = jest.fn();
    updateHandler = new UpdateHandler(mockOnUpdate, initialTimeout);
  });

  afterEach(() => {
    jest.clearAllTimers(); // To clear the timers after each test
  });

  describe('setTimeout', () => {
    it('should update the timeout when setTimeout is called', () => {
      const newTimeout = 2000;
      updateHandler.setTimeout(newTimeout);

      expect(updateHandler.state.updateTimeout).toBe(newTimeout);
    });
  });

  describe('start', () => {
    it('should start the update interval when start is called', () => {
      updateHandler.start();
      expect(updateHandler.state.isUpdating).toBe(true);
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('should not start a new interval if already updating', () => {
      updateHandler.start();
      const initialInterval = updateHandler['_updateInterval'];
      updateHandler.start(); // Try starting again

      // Ensure no new interval is set
      expect(updateHandler['_updateInterval']).toBe(initialInterval);
    });
  });

  describe('stop', () => {
    it('should stop the update interval when stop is called', () => {
      updateHandler.start();
      updateHandler.stop();
      expect(updateHandler.state.isUpdating).toBe(false);
    });

    it('should not throw an error if stop is called without a running interval', () => {
      expect(() => updateHandler.stop()).not.toThrow();
    });
  });

  describe('add', () => {
    it('should add a node to the needs update queue', () => {
      updateHandler.add('node1', 'data');
      expect(updateHandler['_needsUpdate']['node1']).toBe('data');
    });
  });

  describe('remove', () => {
    it('should remove a node from the needs update queue', () => {
      updateHandler.add('node1', 'data');
      updateHandler.remove('node1');
      expect(updateHandler['_needsUpdate']).not.toHaveProperty('node1');
    });
  });
});
