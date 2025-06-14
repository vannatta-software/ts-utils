import { HandlerRegistry } from '../handler.registry';
import { Command, Query, IDomainEvent, ICommandHandler, IQueryHandler, IEventHandler, IIntegrationHandler } from '@vannatta-software/ts-utils-domain';

// Mock Command, Query, Event classes
class MockCommand extends Command<void> {}
class MockQuery extends Query<void> {}
class MockEvent implements IDomainEvent {
    dateTimeOccurred: Date = new Date();
}

// Mock Handlers
class MockCommandHandler implements ICommandHandler<MockCommand> {
    handle = jest.fn();
}

class MockQueryHandler implements IQueryHandler<MockQuery> {
    handle = jest.fn();
}

class MockEventHandler implements IEventHandler<MockEvent> {
    handle = jest.fn();
}

class MockIntegrationHandler implements IIntegrationHandler<any> {
    handle = jest.fn();
}

describe('HandlerRegistry', () => {
    let registry: HandlerRegistry;

    beforeEach(() => {
        registry = new HandlerRegistry();
    });

    describe('registerCommandHandler and getCommandHandler', () => {
        it('should register and retrieve a command handler', () => {
            const handler = new MockCommandHandler();
            registry.registerCommandHandler(MockCommand, handler);

            const retrievedHandler = registry.getCommandHandler(MockCommand.name);
            expect(retrievedHandler).toBe(handler);
        });

        it('should return undefined if no command handler is found', () => {
            const retrievedHandler = registry.getCommandHandler('NonExistentCommand');
            expect(retrievedHandler).toBeUndefined();
        });
    });

    describe('registerQueryHandler and getQueryHandler', () => {
        it('should register and retrieve a query handler', () => {
            const handler = new MockQueryHandler();
            registry.registerQueryHandler(MockQuery, handler);

            const retrievedHandler = registry.getQueryHandler(MockQuery.name);
            expect(retrievedHandler).toBe(handler);
        });

        it('should return undefined if no query handler is found', () => {
            const retrievedHandler = registry.getQueryHandler('NonExistentQuery');
            expect(retrievedHandler).toBeUndefined();
        });
    });

    describe('registerEventHandler and getEventHandlers', () => {
        it('should register and retrieve event handlers', () => {
            const handler1 = new MockEventHandler();
            const handler2 = new MockEventHandler();

            registry.registerEventHandler(MockEvent, handler1);
            registry.registerEventHandler(MockEvent, handler2);

            const retrievedHandlers = registry.getEventHandlers(MockEvent.name);
            expect(retrievedHandlers).toEqual([handler1, handler2]);
        });

        it('should return an empty array if no event handlers are found', () => {
            const retrievedHandlers = registry.getEventHandlers('NonExistentEvent');
            expect(retrievedHandlers).toEqual([]);
        });

        it('should register multiple handlers for the same event', () => {
            const handler1 = new MockEventHandler();
            const handler2 = new MockEventHandler();
            registry.registerEventHandler(MockEvent, handler1);
            registry.registerEventHandler(MockEvent, handler2);
            expect(registry.getEventHandlers(MockEvent.name)).toHaveLength(2);
        });
    });

    describe('registerIntegration and getIntegrationHandlers', () => {
        it('should register and retrieve integration handlers', () => {
            const handler1 = new MockIntegrationHandler();
            const handler2 = new MockIntegrationHandler();
            const integrationName = 'TestIntegration';

            registry.registerIntegration(integrationName, handler1);
            registry.registerIntegration(integrationName, handler2);

            const retrievedHandlers = registry.getIntegrationHandlers(integrationName);
            expect(retrievedHandlers).toEqual([handler1, handler2]);
        });

        it('should return an empty array if no integration handlers are found', () => {
            const retrievedHandlers = registry.getIntegrationHandlers('NonExistentIntegration');
            expect(retrievedHandlers).toEqual([]);
        });
    });

    describe('getIntegrationHandlerNames', () => {
        it('should return the names of all registered integrations', () => {
            registry.registerIntegration('IntegrationA', new MockIntegrationHandler());
            registry.registerIntegration('IntegrationB', new MockIntegrationHandler());

            const names = registry.getIntegrationHandlerNames();
            expect(names).toEqual(['IntegrationA', 'IntegrationB']);
        });

        it('should return an empty array if no integrations are registered', () => {
            const names = registry.getIntegrationHandlerNames();
            expect(names).toEqual([]);
        });
    });
});
