import { describe, it, expect } from "vitest";
import { useHandlerUrl } from "./hooks.ts";
import { render } from "@testing-library/react";
import { RuntimeContext } from "./context.ts";
import { mockRuntime } from "./testing";
import { useContext } from "react";

const MockComponent = () => {
  const handlerUrl = useHandlerUrl("bork");
  // Also try to get the context directly here, while we're at it.
  const { runtime } = useContext(RuntimeContext);
  runtime.notify("rendered", {});
  return <div>Handler URL is "{handlerUrl}"</div>;
};

describe("useHandlerUrl", () => {
  it("Functions without a provider", () => {
    const screen = render(<MockComponent />);
    screen.getByText('Handler URL is ""');
  });
  it("Functions with a provider", () => {
    const runtime = mockRuntime();
    const element = document.createElement("div");
    const screen = render(
      <RuntimeContext.Provider value={{ runtime, element }}>
        <MockComponent />
      </RuntimeContext.Provider>,
    );
    screen.getByText('Handler URL is "/handler/bork"');
    expect(runtime.notify).toHaveBeenCalledWith("rendered", {});
  });
});
