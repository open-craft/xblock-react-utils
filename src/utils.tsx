import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { IntlProvider } from "react-intl";
import type { ThemeConfig, ThemeUrls, XBlockConfig, XBlockRuntime } from "./types.ts";
import { RuntimeContext } from "./context.ts";

type JsrtFields = Record<`_jsrt${string}`, unknown>;

/**
 * Copies all `_jsrt*` properties from source to target.
 * The XBlock iframe runtime used by Content Libraries injects these fields onto DOM elements;
 * copying them ensures they remain accessible after we extract the raw Element from a
 * jQuery wrapper.
 */
const copyJsrtFields = (target: Element, source: Element | JQuery<Element>): void => {
  for (const key of Object.getOwnPropertyNames(source)) {
    if (key.startsWith("_jsrt")) {
      const jsrtKey = key as `_jsrt${string}`;
      (target as Element & JsrtFields)[jsrtKey] = (source as unknown as JsrtFields)[jsrtKey];
    }
  }
};

/**
 * Extracts the raw Element from a plain Element or jQuery wrapper, then copies
 * any _jsrt* runtime fields onto it before returning.
 */
export const getRoot = (element: Element | JQuery<Element>): Element => {
  const container: Element | null =
    element && "jquery" in element ? (element as JQuery<Element>)[0] : element;

  if (!container || !(container instanceof Element)) {
    console.error("Invalid DOM element provided to renderBlock:", element);
    throw new Error("Invalid DOM Element. See previously logged details.");
  }
  // xblock runtime in iframe injects runtime fields (prefixed with _jsrt) into
  // DOM elements. Copy all such fields from source(s) to container so they're
  // available on the extracted raw element.
  // https://raw.githubusercontent.com/openedx/edx-platform/4ba769509c957503c3b78f25a64cc2cf9646e157/common/templates/xblock_v2/xblock_iframe.html
  copyJsrtFields(container, element);
  return container;
};

/**
 * Fetches Paragon theme stylesheet URLs from the MFE config API.
 * Returns `core` and `theme` arrays, each combining the CDN default with an
 * optional brand-override URL pulled from PARAGON_THEME_URLS in the config response.
 * Falls back to CDN-only URLs if the fetch fails.
 */
const getThemes = (themeConfig?: ThemeConfig | null) => {
  let themeUrls: ThemeUrls | Record<string, never> = {};
  if (themeConfig) {
    if (themeConfig.version === "v0-alpha") {
      console.warn(
        "Theme configuration is experimental. Your XBlock WILL break upon the next release.",
      );
      themeUrls = themeConfig.urls;
    } else {
      console.error(
        `Unsupported theme version, "${themeConfig.version}". Falling back to default theme URLs. You may need a different version of xblock-react-utils.`,
      );
    }
  }
  const variant = themeUrls?.defaults?.light;
  const theme: string[] = [
    "https://cdn.jsdelivr.net/npm/@openedx/paragon@23/dist/light.min.css",
    themeUrls?.["variants"]?.[variant]?.["urls"]?.["brandOverride"],
  ].filter(Boolean);
  const core = [
    "https://cdn.jsdelivr.net/npm/@openedx/paragon@23/dist/core.min.css",
    themeUrls?.["core"]?.["urls"]?.["brandOverride"],
  ].filter(Boolean);

  return { core, theme };
};

// Re: The Shadow DOM
// The Shadow DOM allows us to isolate the XBlock from the rest of the page. Any
// Stylesheets we attach inside it will not affect outside content, and any outside
// styling will leak inside it. However, for this to work all the styling need to be
// inside the Shadow DOM.
// There are currently a few issues with this which is why it's disabled:
// - Paragon CSS doesn't use the :host selector for variables.
// - Variables scoped to :root will only work inside the Shadow DOM if included
//   in a stylesheet outside the Shadow DOM. If loaded inside the Shadow DOM,
//   they will not be available.
// - Variables scoped to :host will work inside the Shadow DOM if the stylesheet
//   is loaded inside the Shadow DOM. PR here: https://github.com/openedx/paragon/pull/4282
// So we temporarily need to load the Paragon CSS both inside and outside the Shadow DOM.

interface XBlockRootParams {
  runtime: XBlockRuntime;
  element: Element | JQuery<Element>;
  config: XBlockConfig;
  styles?: string;
}

/**
 * Two-step factory for mounting a React XBlock into the DOM.
 * First invocation takes static configuration (runtime, element, config, styles).
 * Second invocation takes React children, fetches Paragon theme URLs, sets up
 * the Shadow DOM, injects stylesheets, and renders the tree inside
 * RuntimeContext and IntlProvider.
 */
export const createXBlockRoot =
  ({ runtime, element, config, styles }: XBlockRootParams) =>
  async (children: React.ReactNode) => {
    const { core, theme } = getThemes(config.theme);
    const rootElement = getRoot(element);
    let root: Element;
    const shadowRoot = rootElement.attachShadow({ mode: "open" });
    root = document.createElement("div");
    root.classList.add("xblock-root");
    shadowRoot.appendChild(root);
    if (styles) {
      const style = document.createElement("style");
      style.textContent = styles;
      shadowRoot.appendChild(style);
    }
    core.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      shadowRoot?.appendChild(link);
      if (!document.head.querySelector(`link[href="${url}"]`)) {
        document.head.appendChild(link.cloneNode());
      }
    });
    theme.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      shadowRoot?.appendChild(link);
      if (!document.head.querySelector(`link[href="${url}"]`)) {
        document.head.appendChild(link.cloneNode());
      }
    });
    return createRoot(root).render(
      <StrictMode>
        <RuntimeContext.Provider value={{ runtime, element: rootElement }}>
          <IntlProvider locale="en">{children}</IntlProvider>
        </RuntimeContext.Provider>
      </StrictMode>,
    );
  };
