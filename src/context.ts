import { createContext } from "react";
import type { XBlockRuntime } from "./types.ts";

const mockRuntime = (): XBlockRuntime => {
  return {
    handlerUrl(): string {
      return "";
    },
    notify(): void {},
  };
};

export interface RuntimeContextInterface {
  runtime: XBlockRuntime;
  element: Element;
}

// Provides the XBlock runtime and host element to any component in the tree.
// The default value is a safe no-op fallback for components rendered outside a Provider.
export const RuntimeContext = createContext<RuntimeContextInterface>({
  runtime: mockRuntime(),
  element: document.createElement("div"),
});
