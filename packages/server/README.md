# `@vannatta-software/ts-utils-server`

This package provides foundational components and utilities for building robust and scalable server-side applications in TypeScript, particularly those following Command Query Responsibility Segregation (CQRS) and event-driven architectures.

## Core Server Components

### 1. `EventBus` (`event.bus.ts`)

**Purpose:**
Provides an abstract base for event publishing and subscription, handling `Integration` events with deduplication.

**Key Functionality:**
-   Publishes `Integration` events.
-   Subscribes to and unsubscribes from topics.
-   `BaseEventBus` uses `HandlerRegistry` and `IEventEmitter` for in-process event handling.

### 2. `HandlerRegistry` (`handler.registry.ts`)

**Purpose:**
A central repository for mapping commands, queries, events, and integration events to their respective handlers using TypeScript decorators.

**Key Functionality:**
-   Registers and retrieves Command, Query, Event, and Integration handlers.
-   Uses `@CommandHandler`, `@QueryHandler`, `@EventHandler`, `@IntegrationHandler` decorators for declarative registration.

### 3. `Mediator` (`mediator.service.ts`)

**Purpose:**
Implements the Mediator pattern, acting as a central dispatcher for commands, queries, and domain events.

**Key Functionality:**
-   Dispatches commands and queries to registered handlers.
-   Publishes individual and batched domain events.
-   Integrates with `Model.validate` for input validation.
-   Uses `ILogger` for logging and `IEventEmitter` for WebSocket notifications.

## Common Utilities

### 4. `EventEmitter` (`common/event-emitter.ts`, `common/event-emitter.class.ts`)

**Purpose:**
Provides an interface (`IEventEmitter`) and a concrete implementation for in-process event emission and subscription.

**Key Functionality:**
-   Emits events with arguments.
-   Registers and removes event listeners.

### 5. `ILogger` (`common/logger.ts`)

**Purpose:**
Defines a standard interface for logging operations, promoting consistent logging practices.

**Key Functionality:**
-   Supports `log`, `error`, `warn`, `debug`, `verbose` logging levels.
-   Allows optional context for log organization.

### 6. `ClassType` (`common/types.ts`)

**Purpose:**
A utility type representing the constructor signature of a class for type-safe manipulation of class types.

**Key Functionality:**
-   Enables functions/methods to accept class constructors as arguments.

### 7. `IWebSocketClient` & `IWebSocketServer` (`common/websockets.ts`)

**Purpose:**
Defines interfaces for abstracting WebSocket client and server functionalities for decoupled real-time communication.

**Key Functionality:**
-   `IWebSocketClient`: Represents a connected client with event emission/listening.
-   `IWebSocketServer`: Represents a server with global/room-specific event emission and connection handling.

### 8. `ApiException` (`common/exceptions/api.exception.ts`)

**Purpose:**
A custom error class for API-related exceptions, allowing structured error details.

**Key Functionality:**
-   Extends `Error` with a `name` property 'ApiException'.
-   Optionally includes an `errors` property for validation failures.

## Database Abstractions

### 9. `DatabaseContext` (`database/database.context.ts`)

**Purpose:**
A central point for initializing and managing database repositories.

**Key Functionality:**
-   Orchestrates setup of data access components.
-   Takes `Mediator` and `ILogger` as dependencies.

### 10. `IDatabaseModel` (`database/database.model.interface.ts`)

**Purpose:**
Defines a generic interface for common database model operations, abstracting underlying ORM/ODM specifics.

**Key Functionality:**
-   Standardized methods for `find`, `findById`, `aggregate`, `findByIdAndUpdate`, `findByIdAndDelete`.
-   Methods return objects with an `exec()` method for query execution.

### 11. `IRepository` (`database/repository.interface.ts`)

**Purpose:**
Defines a generic interface for abstracting persistence operations for `Entity` objects, decoupling the domain from storage technology.

**Key Functionality:**
-   Provides standard CRUD operations (`findAll`, `findById`, `insert`, `update`, `delete`).
-   Supports `search` and `aggregate` for querying.
-   `onHydrate` for converting raw documents to domain entities.

### 12. `InMemoryRepository` (`database/in-memory/in-memory.repository.ts`)

**Purpose:**
A concrete `IRepository` implementation that stores data in memory, ideal for testing and development.

**Key Functionality:**
-   Uses a JavaScript `Map` for in-memory storage.
-   Provides basic CRUD, search, and aggregation.
-   Publishes domain events via `Mediator` after data modifications.

## Notification Services

### 13. `ClientMap` (`notifications/client.map.ts`)

**Purpose:**
Manages and organizes connected WebSocket clients, tracking them by socket ID, application ID, and user ID.

**Key Functionality:**
-   Connects, disconnects, remembers/forgets application clients.
-   Logs in/out users, supporting multiple connections per user.
-   Retrieves clients by various criteria (`all`, `getSocket`, `getSockets`).

### 14. `INotifiableClient` (`notifications/notifiable.client.ts`)

**Purpose:**
Defines a simple interface for any client that can receive notifications, abstracting communication channel details.

**Key Functionality:**
-   `clientId` for unique identification.
-   `send(event: string, data: any)` method to dispatch a notification.

### 15. `NotificationService` (`notifications/notification.service.ts`)

**Purpose:**
Sends real-time notifications to connected clients, users, or specific applications.

**Key Functionality:**
-   Uses `ClientMap` to manage recipients.
-   Supports broadcast, user-targeted, and application-targeted notifications.
-   Allows mapping domain events to custom notification payloads.
