# @opencraft/xblock-react-utils

React utilities, hooks, and context for building Open edX XBlocks.

## Installation

```bash
pnpm add @opencraft/xblock-react-utils
```

## What's included

### Main package

| Export                          | Description                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| `createXBlockRoot`              | Entry point for mounting a React XBlock. Handles Paragon themes, Shadow DOM, and providers. |
| `useHandlerUrl(name)`           | Hook that returns the URL for an XBlock handler.                                            |
| `RuntimeContext`                | React context exposing `runtime` and `element` from the edX platform.                       |
| `deriveColor(name, value)`      | Validates a hex color and returns a `CSSProperties` object.                                 |
| `XBlockRuntime`, `XBlockConfig` | TypeScript types for the XBlock runtime and config.                                         |

### Testing utilities

Import from `@opencraft/xblock-react-utils/testing`. Requires `vitest` and `@testing-library/react`.

| Export          | Description                                                                                                                             |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `render`        | Wraps `@testing-library/react`'s render with `StrictMode` and `IntlProvider`. Also re-exports everything from `@testing-library/react`. |
| `mockRuntime()` | Returns a mock `XBlockRuntime` with vitest spies.                                                                                       |
| `stubJquery()`  | Stubs `$.post()` with a jQuery-style deferred for legacy edX patterns.                                                                  |
