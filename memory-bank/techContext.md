# Tech Context

## Technologies Used
- **TypeScript**: Primary programming language.
- **Node.js**: Runtime environment for development and testing.
- **Jest**: Testing framework for unit and integration tests.
- **React**: Used in `packages/frontend` for UI components (implied by `.tsx` files like `EndpointCollection.tsx`).
- **npm/Yarn**: Package managers (implied by `package.json` files).
- **Yarn Workspaces**: Used for monorepo management (confirmed by `package.json` at root).
- **Git**: Version control.

## Development Setup
- **Monorepo Structure**: The project is organized as a monorepo using Yarn Workspaces, allowing for shared dependencies and easier management of interconnected packages.
- **Transpilation**: TypeScript code is transpiled to JavaScript for execution using `tsc` (TypeScript compiler) based on `tsconfig.json` files.
- **Testing Environment**: Jest is configured for each package, indicating a dedicated testing setup per module.
- **Linting/Formatting**: Not explicitly configured at the root level, but individual packages may have their own setups.

## Technical Constraints
- **TypeScript Version**: Compatibility with a specific TypeScript version might be a constraint.
- **Node.js Version**: The project might require a minimum Node.js version.
- **Browser Compatibility**: For `packages/frontend`, compatibility with target browsers is a consideration.
- **Performance**: Utilities should be optimized for performance where critical.

## Dependencies
- **Internal Dependencies**:
    - `packages/domain` might depend on `packages/core`.
    - `packages/frontend` might depend on `packages/core` and `packages/domain`.
- **External Dependencies**:
    - `jest` for testing.
    - `react` for frontend components.
    - Other third-party libraries as needed by individual utilities (e.g., `axios` for HTTP requests, `lodash` for general utilities, etc. - to be confirmed by inspecting `package.json` files within packages).

## Tool Usage Patterns
- **`npm install` / `yarn install`**: For dependency management.
- **`npm test` / `yarn test`**: For running tests.
- **`npm build` / `yarn build`**: For compiling TypeScript code.
- **`git` commands**: For version control operations.
