import { afterEach } from "vitest";
import { jQueryFactory } from "jquery/factory";
import { JSDOM } from "jsdom";
// @ts-expect-error Default export not annotated.
import initMockJax from "jquery-mockjax";

afterEach(() => {
  $.mockjax.clearAll();
});

const window = new JSDOM("<html></html>").window;

// @ts-expect-error Doesn't expect to get JSDOM's simulated Window
window.$ = jQueryFactory(window);

// Stub out AJAX calls in Jquery and add an interface for mocking them.
initMockJax(window.$, window);

window.$.mockjaxSettings.logLevel = 1; // warning messages

// @ts-expect-error global is both defined and not defined, between type checking
// and the test environment. No settings satisfy both.
global.$ = window.$;
