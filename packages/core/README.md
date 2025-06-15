# `@vannatta-software/ts-utils-core`

This package provides a collection of fundamental utility classes and helper functions designed to support various common programming tasks in TypeScript applications.

## Core Utility Classes

### 1. `ApiClient` (`ApiClient.ts`)

**Purpose:**
Provides a static interface for making HTTP requests with Axios, handling authentication, XSRF tokens, and connection IDs.

**Key Functionality:**
-   Global configuration for API calls.
-   Configures headers and sends HTTP requests.
-   Processes Axios responses into `SuccessResponse` or `ErrorResponse` objects.

### 2. `ArrayUtils` (`ArrayUtils.ts`)

**Purpose:**
A static utility class offering comprehensive methods for common array manipulation tasks.

**Key Functionality:**
-   **Transformation:** `flatten`, `arrayToMap`, `chunk`.
-   **Filtering & Uniqueness:** `unique`, `compact`.
-   **Set Operations:** `combine`, `difference`, `intersection`.
-   **Iteration & Ordering:** `forEachRandom`, `shuffle`.
-   **Grouping:** `groupBy`.

### 3. `EventSource` (`EventSource.ts`)

**Purpose:**
Implements a simple observable pattern for managing event observers and dispatching updates.

**Key Functionality:**
-   Manages adding, removing, and retrieving observers.
-   Notifies observers of events, with optional filtering.
-   `EventObserver` class for defining update and destroy handlers.

### 4. `FetchBuffer` (`FetchBuffer.ts`)

**Purpose:**
Controls the rate of function execution, acting as a simple debouncer or throttler.

**Key Functionality:**
-   Limits function calls within a specified time window.
-   Provides control over buffer state (`canAttempt`, `cancel`, `setWaitTime`).

### 5. `FileUtils` (`FileUtils.ts`)

**Purpose:**
Offers static methods for interacting with files in both Node.js (file system) and browser (file manipulation, downloads) environments.

**Key Functionality:**
-   **File System (Node.js):** `forEachFile`.
-   **Path Manipulation:** `getFolderName`.
-   **Browser File Handling:** `blobToFile`, `createResource`, `saveFile`.

### 6. `HttpUtils` (`HttpUtils.ts`)

**Purpose:**
Provides a robust and flexible `HttpClient` class built on Axios for complex HTTP request scenarios.

**Key Functionality:**
-   Configurable client with support for all HTTP methods.
-   Middleware support for request pipeline injection.
-   Request cancellation and URL placeholder replacement.
-   Standardized error handling.

### 7. `MaskUtils` (`MaskUtils.ts`)

**Purpose:**
A static utility class for formatting and masking various types of data (e.g., currency, phone numbers, credit cards).

**Key Functionality:**
-   Applies custom mask patterns.
-   Formats numbers as currency.
-   Provides standard masks for phone numbers, SSN, and credit cards.

### 8. `NumberUtils` (`NumberUtils.ts`)

**Purpose:**
A comprehensive static utility class for mathematical and numerical operations.

**Key Functionality:**
-   **Rounding:** `round`, `floor`, `ceil`.
-   **Range Operations:** `inRange`, `clamp`, `mapRange`.
-   **Random Numbers:** `random`, `randomInt`.
-   **Type Checking:** `isFinite`, `isInteger`.
-   **Formatting:** `formatWithCommas`, `toPercentage`.
-   **Conversions:** `toNumber`, `degreesToRadians`, `radiansToDegrees`.
-   **Mathematical Functions:** `factorial`, `gcd`, `lcm`.
-   **Comparison:** `approximatelyEqual`.

### 9. `ReflectionUtils` (`ReflectionUtils.ts`)

**Purpose:**
Provides utilities for working with TypeScript decorators and metadata for runtime inspection and manipulation of class/property definitions.

**Key Functionality:**
-   Manages metadata (`getMetadata`, `setMetadata`, etc.).
-   Supports custom decorators (`Field`, `View`, `Schema`).
-   Retrieves and merges metadata.

### 10. `ResponseUtils` (`ResponseUtils.ts`)

**Purpose:**
Defines standardized interfaces and classes for handling API responses, ensuring consistent structure for success and error payloads.

**Key Functionality:**
-   Defines `IServerResponse`, `IServerError` interfaces.
-   Provides `SuccessResponse` and `ErrorResponse` classes for structured data/error access.
-   Manages validation errors and feedback messages.

### 11. `StringUtils` (`StringUtils.ts`)

**Purpose:**
A rich static utility class for string manipulation, formatting, and generation tasks.

**Key Functionality:**
-   **Case Conversion:** `camelCase`, `capitalize`, `kebabCase`, `snake`, `studly`, `titleCase`.
-   **Formatting:** `plural`, `singular`, `limit`, `finish`, `start`.
-   **Comparison & Search:** `startsWith`, `endsWith`, `sort`.
-   **Replacement:** `replaceArray`, `replaceFirst`, `replaceLast`, `removeSlug`.
-   **Generation:** `lorem`, `random`, `UUID`.
-   **URL Utilities:** `urlSafe`, `fromUrl`.
-   **Palindrome Check:** `isPalindrome`.

### 12. `TimeUtils` (`TimeUtils.ts`)

**Purpose:**
Provides static methods for time-related operations, including asynchronous delays, function debouncing, throttling, and duration formatting.

**Key Functionality:**
-   **Asynchronous Delays:** `timeout`, `sleep`.
-   **Rate Limiting:** `debounce`, `throttle`.
-   **Formatting:** `formatDuration`.

### 13. `UpdateHandler` (`UpdateHandler.ts`)

**Purpose:**
Manages and batches updates for a collection of nodes, allowing for periodic processing of accumulated changes.

**Key Functionality:**
-   Collects and processes updates in batches at defined intervals.
-   Controls update interval (`start`, `stop`, `setTimeout`).
-   Manages pending nodes (`add`, `remove`).

### 14. `Validator` (`Validator.ts`)

**Purpose:**
Provides a flexible and extensible way to validate data against predefined rules, accumulating errors for detailed feedback.

**Key Functionality:**
-   Rule-based validation for various data types and formats.
-   Manages validation errors (`errors`, `hasErrors`, `addErrors`, `removeError`).
-   Includes predefined regex patterns for common validations.
