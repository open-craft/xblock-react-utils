import { StrictMode, type ReactNode, type ReactElement } from "react";
import { vi, beforeEach, afterEach } from "vitest";
import { IntlProvider } from "react-intl";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";

import type { XBlockRuntime } from "../types";

/**
 * Returns a minimal XBlockRuntime mock for unit tests.
 */
export const mockRuntime = (): XBlockRuntime => {
  return {
    notify: vi.fn(),
    handlerUrl: vi.fn().mockImplementation((_element, name: string) => `/handler/${name}`),
  };
};

// ── jQuery mock ──────────────────────────────────────────────────────────────
// $.post returns a jQuery-style deferred with .done()/.fail() chaining.
interface MockDeferred {
  done: (cb: () => void) => MockDeferred;
  fail: (cb: () => void) => MockDeferred;
  _resolveDone: () => void;
  _resolveFail: () => void;
}

function createMockDeferred(): MockDeferred {
  let doneCb: (() => void) | null = null;
  let failCb: (() => void) | null = null;
  const deferred: MockDeferred = {
    done(cb) {
      doneCb = cb;
      return deferred;
    },
    fail(cb) {
      failCb = cb;
      return deferred;
    },
    _resolveDone() {
      doneCb?.();
    },
    _resolveFail() {
      failCb?.();
    },
  };
  return deferred;
}

/**
 * Stubs the global `$` (jQuery) with a mock that intercepts `$.post` calls.
 * Call this inside a `describe` block; it registers beforeEach/afterEach hooks
 * automatically to install and restore the stub around every test.
 */
export const stubJquery = () => {
  let lastDeferred: MockDeferred | undefined;

  const mockPost = vi.fn(() => {
    lastDeferred = createMockDeferred();
    return lastDeferred;
  });

  const getLastDeferred = () => lastDeferred;

  let originalJq: unknown = undefined;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    originalJq = (globalThis as any).$;
    // Assign to globalThis so the component's `$.post(...)` calls hit our mock.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).$ = { post: mockPost };
  });

  afterEach(() => {
    mockPost.mockClear();
    lastDeferred = undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).$ = originalJq;
  });
  return { getLastDeferred, mockPost };
};

// Wraps children in StrictMode + IntlProvider (locale="en") for all tests.
const Providers = ({ children }: { children: ReactNode }) => (
  <StrictMode>
    <IntlProvider locale="en">{children}</IntlProvider>
  </StrictMode>
);

// Thin wrapper around RTL's render that injects Providers as the wrapper automatically.
const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
): RenderResult => render(ui, { wrapper: Providers, ...options });

export { renderWithProviders as render };
