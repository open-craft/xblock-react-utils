import { describe, expect, it } from "vitest";
import { mockRuntime, render } from "./helpers.tsx";

describe("mockRuntime", () => {
  it("derives a handler URL", () => {
    const runtime = mockRuntime();
    const element = document.createElement("div");
    expect(runtime.handlerUrl(element, "beep")).toEqual("/handler/beep");
  });
  it("Accepts notifications", () => {
    const runtime = mockRuntime();
    runtime.notify("yeet", { state: "yoten" });
    expect(runtime.notify).toHaveBeenCalledWith("yeet", { state: "yoten" });
  });
});

const SideEffect = (props: { counter: { value: number } }) => {
  // Wrapped components are used with strict mode. Strict mode re-runs
  // render immediately upon mount so any side effects show up in a loud
  // way by happening twice.
  props.counter.value += 1;
  return <div>{props.counter.value}</div>;
};

describe("render", () => {
  it("Renders a wrapped component", () => {
    const counter = { value: 0 };
    const screen = render(<SideEffect counter={counter} />);
    expect(screen.getByText("2")).toBeTruthy();
  });
});
