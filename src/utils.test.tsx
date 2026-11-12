import fetchMock from "fetch-mock";
import { describe, it, vi, expect, afterEach, beforeEach, afterAll } from "vitest";
import { waitFor } from "@testing-library/react";
import { screen } from "shadow-dom-testing-library";
import { createXBlockRoot, getRoot, ThemeUrls } from "./utils.tsx";
import { mockRuntime } from "./testing";
import { act } from "react";

describe("createXBlockRoot", () => {
  const mockError = vi.spyOn(console, "error");
  beforeEach(() => {
    const themeUrls: ThemeUrls = {
      default: {
        light: "https://localhost/styles/light.css",
      },
      variants: {},
      core: {
        urls: {
          default: "https://localhost/styles/core/default.css",
          brandOverride: "https://localhost/styles/core/override.css",
        },
      },
    };
    fetchMock.route({
      url: "https://localhost/beep",
      response: { status: 200, body: { PARAGON_THEME_URLS: themeUrls } },
    });
    fetchMock.route({
      url: "begin:https://localhost/styles/",
      response: { status: 200, body: "" },
    });
  });
  afterEach(() => {
    document.body.innerHTML = "";
    mockError.mockReset();
  });
  afterAll(() => {
    mockError.mockClear();
  });
  const buildEnvironment = () => {
    const element = document.createElement("div");
    element.setAttribute("id", "block-root");
    document.querySelector("body")!.append(element);
    const runtime = mockRuntime();
    const config = { mfe_config_api: "https://localhost/beep" };
    const styles = `
    .boop {
      font-weight: 800;
    }
    `;
    return { element, runtime, config, styles };
  };
  it("creates an XBlock root from an element", async () => {
    const { element, runtime, config, styles } = buildEnvironment();
    await act(async () => {
      await createXBlockRoot({ element, runtime, config, styles })(
        <div className="boop">I'm a test app.</div>,
      );
    });
    const main = await waitFor(() => screen.getByShadowText("I'm a test app."));
    // @ts-expect-error Index type not established.
    expect(getComputedStyle(main)["font-weight"]).toEqual("800");
    expect(mockError).not.toHaveBeenCalled();
  });
  it("creates an XBlock root from a jQuery object", async () => {
    const { element: baseElement, runtime, config, styles } = buildEnvironment();
    const element = $(baseElement);
    await act(async () => {
      await createXBlockRoot({ element, runtime, config, styles })(
        <div className="boop">I'm a test app.</div>,
      );
    });
    const main = await waitFor(() => screen.getByShadowText("I'm a test app."));
    // @ts-expect-error Index type not established.
    expect(getComputedStyle(main)["font-weight"]).toEqual("800");
    expect(mockError).not.toHaveBeenCalled();
  });
  it("Copies over jsrt properties", async () => {
    const { element: baseElement, runtime, config, styles } = buildEnvironment();
    const element = $(baseElement);
    // @ts-expect-error Forcibly set prop.
    element._jsrt_xb_handler_url = "https://example.com/handling-it/";
    // @ts-expect-error Forcibly set prop.
    element._jsrt_xb_usage_id = "blockv6@thing";
    // @ts-expect-error Forcibly set prop.
    element._jsrt_something = "whatever";
    mockError.mockImplementation(() => undefined);
    await act(async () => {
      await createXBlockRoot({ element, runtime, config, styles })(
        <div className="boop">I'm a test app.</div>,
      );
    });
    await waitFor(() => screen.getByShadowText("I'm a test app."));
    // @ts-expect-error Forcibly set prop.
    expect(baseElement._jsrt_xb_handler_url).toEqual("https://example.com/handling-it/");
    // @ts-expect-error Forcibly set prop.
    expect(baseElement._jsrt_xb_usage_id).toEqual("blockv6@thing");
    // @ts-expect-error Forcibly set prop.
    expect(baseElement._jsrt_something).toEqual("whatever");
    expect(mockError).not.toHaveBeenCalled();
  });
  it("Provides a useful error if the theme URL is borked", async () => {
    const { element, runtime, config, styles } = buildEnvironment();
    mockError.mockImplementation(() => undefined);
    config.mfe_config_api = "https://localhost/bork";
    await act(async () => {
      await createXBlockRoot({ element, runtime, config, styles })(
        <div className="boop">I'm a test app.</div>,
      );
    });
    expect(mockError).toHaveBeenCalledWith(
      "Failed to fetch theme URLs:",
      new Error("fetch-mock: No response or fallback rule to cover get to https://localhost/bork"),
    );
  });
  it("Bails if the runtime has provided a null element", async () => {
    const { runtime, config, styles } = buildEnvironment();
    mockError.mockImplementation(() => undefined);
    await expect(
      act(async () => {
        // @ts-expect-error Forcible bogus element for poorly typechecked environments
        await createXBlockRoot({ element: null, runtime, config, styles })(
          <div className="boop">I'm a test app.</div>,
        );
      }),
    ).rejects.toThrow(new Error("Invalid DOM Element. See previously logged details."));
  });
});

describe("getRoot", () => {
  const mockError = vi.spyOn(console, "error");
  afterEach(() => {
    mockError.mockReset();
  });
  afterAll(() => {
    mockError.mockClear();
  });
  it("Returns an element if it's already the one we want", () => {
    const element = document.createElement("div");
    expect(getRoot(element)).toBe(element);
  });
  it("Returns an element if it's in a jQuery object", () => {
    const element = document.createElement("div");
    expect(getRoot($(element))).toBe(element);
  });
  it("Throws a useful error if given nonsense", () => {
    mockError.mockImplementation(() => undefined);
    // @ts-expect-error Forcibly set null to test behavior for poorly typechecked source.
    expect(() => getRoot(null)).toThrow(
      new Error("Invalid DOM Element. See previously logged details."),
    );
    expect(mockError).toHaveBeenCalledWith("Invalid DOM element provided to renderBlock:", null);
  });
});
