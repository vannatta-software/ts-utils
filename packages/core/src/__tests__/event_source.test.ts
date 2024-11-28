import { EventObserver, EventSource } from '../EventSource';

describe('EventObserver', () => {
  test('onUpdate should set the update handler', () => {
    const observer = new EventObserver<string>('test');
    const handler = jest.fn();

    observer.onUpdate(handler);
    observer.update('Hello');

    expect(handler).toHaveBeenCalledWith('Hello');
  });

  test('onDestroy should set the destroy handler', () => {
    const observer = new EventObserver<string>('test');
    const handler = jest.fn();

    observer.onDestroy(handler);
    observer.destroy();

    expect(handler).toHaveBeenCalled();
  });
});

describe('EventSource', () => {
  let eventSource: EventSource<string>;

  beforeEach(() => {
    eventSource = new EventSource<string>();
  });

  test('addObserver should add an observer', () => {
    const observer = new EventObserver<string>('test');
    eventSource.addObserver(observer);

    expect(eventSource.getObservers('test')).toContain(observer);
  });

  test('removeObservers should remove all observers with a given ID', () => {
    const observer1 = new EventObserver<string>('test');
    const observer2 = new EventObserver<string>('test');

    eventSource.addObserver(observer1);
    eventSource.addObserver(observer2);

    eventSource.removeObservers('test');

    expect(eventSource.getObservers('test')).toEqual([]);
  });

  test('removeObserver should remove a specific observer', () => {
    const observer = new EventObserver<string>('test');
    eventSource.addObserver(observer);

    eventSource.removeObserver(observer);

    expect(eventSource.getObservers('test')).toEqual([]);
  });

  test('notify should call update on all matching observers', () => {
    const observer1 = new EventObserver<string>('test');
    const observer2 = new EventObserver<string>('other');

    const handler1 = jest.fn();
    const handler2 = jest.fn();

    observer1.onUpdate(handler1);
    observer2.onUpdate(handler2);

    eventSource.addObserver(observer1);
    eventSource.addObserver(observer2);

    eventSource.notify('Hello', 'test');

    expect(handler1).toHaveBeenCalledWith('Hello');
    expect(handler2).not.toHaveBeenCalled();
  });

  test('onUpdate should create and add an observer', () => {
    const handler = jest.fn();
    eventSource.onUpdate('test', handler);

    eventSource.notify('Hello', 'test');

    expect(handler).toHaveBeenCalledWith('Hello');
  });

  test('clearAllObservers should remove all observers', () => {
    const observer1 = new EventObserver<string>('test');
    const observer2 = new EventObserver<string>('other');

    eventSource.addObserver(observer1);
    eventSource.addObserver(observer2);

    eventSource.clearAllObservers();

    expect(eventSource.getObservers('test')).toEqual([]);
    expect(eventSource.getObservers('other')).toEqual([]);
  });
});
