import { DatabaseContext } from '../database.context';
import { Mediator } from '../../mediator.service';
import { ILogger } from '../../common/logger';

describe('DatabaseContext', () => {
    let databaseContext: DatabaseContext;
    let mockMediator: jest.Mocked<Mediator>;
    let mockLogger: jest.Mocked<ILogger>;

    beforeEach(() => {
        mockMediator = {
            sendCommand: jest.fn(),
            sendQuery: jest.fn(),
            publishEvent: jest.fn(),
            publishEvents: jest.fn(),
            // Mock properties required by Mediator's constructor or internal methods
            logger: {} as ILogger, // Dummy logger
            registry: {} as any, // Dummy registry
            eventEmitter: {} as any, // Dummy eventEmitter
            validate: jest.fn(), // Mock private method if needed
        } as unknown as jest.Mocked<Mediator>;

        mockLogger = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        } as jest.Mocked<ILogger>;

        databaseContext = new DatabaseContext(mockMediator, mockLogger);
    });

    it('should be defined', () => {
        expect(databaseContext).toBeDefined();
    });

    it('should log "Initialized repositories" on construction', () => {
        expect(mockLogger.log).toHaveBeenCalledTimes(1);
        expect(mockLogger.log).toHaveBeenCalledWith('Initialized repositories');
    });
});
