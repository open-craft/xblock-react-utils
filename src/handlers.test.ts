import { describe, it, expect } from "vitest";
import { callServer, saveStudioBlock } from "./handlers.ts";
import { mockRuntime } from "./testing";
import { waitFor } from "@testing-library/react";
import jqXHR = JQuery.jqXHR;

const mockError = () => {
  $.mockjax({
    url: "/save",
    method: "POST",
    data: JSON.stringify({ beep: 1 }),
    contentType: "application/json",
    status: 400,
    responseText: { error: "Uncool" },
  });
};

describe("callServer", () => {
  it("Calls the server", async () => {
    $.mockjax({
      url: "/handler/beeper",
      method: "POST",
      data: JSON.stringify({ beep: 1 }),
      contentType: "application/json",
      responseText: { boop: 2 },
    });
    const result = await callServer({ url: "/handler/beeper", data: { beep: 1 } });
    expect(result).toEqual({ boop: 2 });
  });
  it("Rejects", async () => {
    mockError();
    await expect(callServer({ url: "/save", data: { beep: 1 } })).rejects.toHaveProperty(
      "responseJSON",
      { error: "Uncool" },
    );
  });
  it("Handles non-objects", async () => {
    $.mockjax({
      url: "/handler/beeper",
      method: "POST",
      data: "beep",
      contentType: "text/plain",
      responseText: "boop",
    });
    const result = await callServer({ url: "/handler/beeper", data: "beep" });
    expect(result).toEqual("boop");
  });
});

describe("saveStudioBlock", () => {
  it("Sends the save call", async () => {
    $.mockjax({
      url: "/save",
      method: "POST",
      data: JSON.stringify({ beep: 1 }),
      contentType: "application/json",
      responseText: { boop: 2 },
    });
    const runtime = mockRuntime();
    const result = await saveStudioBlock({ saveUrl: "/save", data: { beep: 1 }, runtime });
    expect(result).toEqual({ boop: 2 });
  });
  it("Notifies the runtime upon save start and save completion", async () => {
    $.mockjax({
      url: "/save",
      method: "POST",
      data: JSON.stringify({ beep: 1 }),
      contentType: "application/json",
      responseTime: 500,
      responseText: { boop: 2 },
    });
    const runtime = mockRuntime();
    void saveStudioBlock({ saveUrl: "/save", data: { beep: 1 }, runtime });
    await waitFor(() => expect(runtime.notify).toHaveBeenCalledWith("save", { state: "start" }));
    expect(runtime.notify).toHaveBeenCalledOnce();
    await waitFor(() => expect(runtime.notify).toHaveBeenCalledWith("save", { state: "end" }), {
      timeout: 1000,
    });
    expect(runtime.notify).toHaveBeenCalledTimes(2);
  });
  it("Informs the runtime of an error, if there is one", async () => {
    mockError();
    const runtime = mockRuntime();
    await expect(
      saveStudioBlock({ saveUrl: "/save", data: { beep: 1 }, runtime, errorMessage: "Borked!" }),
    ).rejects.toHaveProperty("responseJSON", { error: "Uncool" });
    expect(runtime.notify).toHaveBeenCalledWith("error", {
      title: "Save Error",
      message: "Borked!",
    });
  });
  it("Dynamically generates an error", async () => {
    mockError();
    const runtime = mockRuntime();
    const deriveError = (response: unknown) => {
      return (response as jqXHR).responseJSON["error"];
    };
    await expect(
      saveStudioBlock({ saveUrl: "/save", data: { beep: 1 }, runtime, errorMessage: deriveError }),
    ).rejects.toHaveProperty("responseJSON", { error: "Uncool" });
    expect(runtime.notify).toHaveBeenCalledWith("error", {
      title: "Save Error",
      message: "Uncool",
    });
  });
});
