import { StrictMode, type ReactNode, type ReactElement } from "react";
import { vi } from "vitest";
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
