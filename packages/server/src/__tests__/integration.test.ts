import { Mediator } from '../mediator.service';
import { HandlerRegistry } from '../handler.registry';
import { InMemoryRepository } from '../database/in-memory/in-memory.repository';
import { NotificationService } from '../notifications/notification.service';
import { EventEmitter } from '../common/event-emitter.class';
import { Command, ICommandHandler, IDomainEvent, IEventHandler, Entity, UniqueIdentifier, DTO, Model } from '@vannatta-software/ts-utils-domain'; // Added Model
import { ILogger } from '../common/logger';
import { ClassType } from '../common/types';

// 1. Define a simple User entity
class User extends Entity {
    public name: string;
    public email: string;

    constructor(props: { id?: UniqueIdentifier, name: string, email: string }) {
        super({ id: props.id });
        this.name = props.name;
        this.email = props.email;
    }

    create(): void {
        // Implementation not needed for this test
    }

    delete(): void {
        // Implementation not needed for this test
    }

    static create(props: { name: string, email: string }): User {
        const user = new User(props);
        user.addDomainEvent(new UserCreatedEvent({ userId: user.id.value, name: user.name }));
        return user;
    }
}

// 2. Define a CreateUserCommand and a UserCreatedEvent
class CreateUserCommand extends Command<User> {
    public name: string;
    public email: string;

    constructor(props?: { name: string, email: string }) { // Made props optional
        super();
        this.name = props?.name ?? ''; // Safely access props and provide default
        this.email = props?.email ?? ''; // Safely access props and provide default
    }
}

class UserCreatedEvent implements IDomainEvent {
    public readonly occurredOn: Date = new Date();
    public readonly dateTimeOccurred: Date = new Date(); // Added for IDomainEvent conformance
    public readonly eventName: string = UserCreatedEvent.name;
    public readonly userId: string;
    public readonly name: string;

    constructor(props: { userId: string, name: string }) {
        this.userId = props.userId;
        this.name = props.name;
    }
}

// Mock IRepository for User
interface IUserRepository {
    save(user: User): Promise<void>;
    findById(id: UniqueIdentifier): Promise<User | undefined>;
}

// 3. Implement a CreateUserCommandHandler
class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand> {
    constructor(
        private readonly userRepository: InMemoryRepository<User>,
        private readonly mediator: Mediator
    ) {}

    async handle(command: CreateUserCommand): Promise<User> {
        const user = User.create({ name: command.name, email: command.email });
        await this.userRepository.insert(user); // Changed from save to insert
        await this.mediator.publishEvents(user); // Publish events after saving
        return user;
    }
}

// 4. Implement a UserCreatedEventHandler
class UserCreatedEventHandler implements IEventHandler<UserCreatedEvent> {
    constructor(private readonly notificationService: NotificationService) {}

    async handle(event: UserCreatedEvent): Promise<void> {
        await this.notificationService.notifyUser(
            event.userId,
            'user-creation',
            `User ${event.name} (${event.userId}) was created.`
        );
    }
}

describe('Framework Integration Test', () => {
    let mediator: Mediator;
    let handlerRegistry: HandlerRegistry;
    let userRepository: InMemoryRepository<User>;
    let notificationService: NotificationService;
    let eventEmitter: EventEmitter;
    let mockLogger: jest.Mocked<ILogger>;

    beforeEach(() => {
        handlerRegistry = new HandlerRegistry();
        eventEmitter = new EventEmitter();
        mockLogger = {
            debug: jest.fn(),
            log: jest.fn(), // Added log method
            warn: jest.fn(),
            error: jest.fn(),
        };
        mediator = new Mediator(handlerRegistry, eventEmitter, mockLogger);
        userRepository = new InMemoryRepository<User>(mediator); // Pass mediator
        notificationService = new NotificationService(mockLogger);

        // Register handlers
        handlerRegistry.registerCommandHandler(
            CreateUserCommand,
            new CreateUserCommandHandler(userRepository, mediator)
        );
        handlerRegistry.registerEventHandler(
            UserCreatedEvent,
            new UserCreatedEventHandler(notificationService)
        );

        // Spy on methods to verify interactions
        jest.spyOn(userRepository, 'insert'); // Changed from save to insert
        jest.spyOn(notificationService, 'notifyUser'); // Changed from sendNotification to notifyUser
        jest.spyOn(mediator, 'publishEvent');
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Changed from clearAllMocks to restoreAllMocks for spies
    });

    it('should successfully create a user, save it, publish an event, and send a notification', async () => {
        const commandData: DTO<CreateUserCommand> = { name: 'John Doe', email: 'john.doe@example.com' };

        // 7. Send the CreateUserCommand through the Mediator
        const createdUser = await mediator.sendCommand(commandData, CreateUserCommand);

        // 8. Assertions
        expect(createdUser).toBeInstanceOf(User);
        expect(createdUser.name).toBe('John Doe');
        expect(createdUser.email).toBe('john.doe@example.com');
        expect(createdUser.id).toBeDefined();

        // Verify repository interaction
        expect(userRepository.insert).toHaveBeenCalledTimes(1); // Changed from save to insert
        expect(userRepository.insert).toHaveBeenCalledWith(expect.any(User)); // Changed from save to insert

        // Verify event publishing
        expect(mediator.publishEvent).toHaveBeenCalledTimes(1);
        expect(mediator.publishEvent).toHaveBeenCalledWith(expect.any(UserCreatedEvent));

        // Verify notification service interaction
        expect(notificationService.notifyUser).toHaveBeenCalledTimes(1); // Changed from sendNotification to notifyUser
        expect(notificationService.notifyUser).toHaveBeenCalledWith(
            expect.any(String), // userId
            'user-creation',
            expect.stringContaining('User John Doe')
        );

        // Verify logger debug calls
        expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('Executing command CreateUserCommand'));
        expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('Publishing event UserCreatedEvent'));
    });

    it('should handle validation errors for commands', async () => {
        // Mock Model.validate to simulate a validation failure
        jest.spyOn(Model, 'validate').mockReturnValue({ // Changed from Entity to Model
            isValid: false,
            errors: { name: ['Name is required'] }, // Corrected error structure
        });

        const commandData: DTO<CreateUserCommand> = { name: '', email: 'test@example.com' };

        await expect(mediator.sendCommand(commandData, CreateUserCommand)).rejects.toThrow('Validation failed');

        expect(userRepository.insert).not.toHaveBeenCalled(); // Changed from save to insert
        expect(mediator.publishEvent).not.toHaveBeenCalled();
        expect(notificationService.notifyUser).not.toHaveBeenCalled(); // Changed from sendNotification to notifyUser
    });

    it('should throw an error if no command handler is found', async () => {
        // Clear command handlers to simulate no handler found
        handlerRegistry = new HandlerRegistry();
        mediator = new Mediator(handlerRegistry, eventEmitter, mockLogger); // Re-initialize mediator
        jest.spyOn(mediator, 'publishEvent'); // Re-spy on the new mediator instance

        const commandData: DTO<CreateUserCommand> = { name: 'No Handler', email: 'no@example.com' };

        await expect(mediator.sendCommand(commandData, CreateUserCommand)).rejects.toThrow(
            'No handler found for command CreateUserCommand'
        );

        expect(userRepository.insert).not.toHaveBeenCalled(); // Changed from save to insert
        expect(mediator.publishEvent).not.toHaveBeenCalled();
        expect(notificationService.notifyUser).not.toHaveBeenCalled(); // Changed from sendNotification to notifyUser
    });
});
