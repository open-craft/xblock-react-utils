import type { SaveStudioBlockParams } from "./types.ts";

/**
 * Persists XBlock Studio configuration via jQuery's legacy $.post pattern.
 * Notifies the runtime of save start/end, and surfaces errors via runtime.notify.
 */
export const saveStudioBlock = <T>({
  saveUrl,
  data,
  runtime,
  errorMessage = "Failed to save configuration",
}: SaveStudioBlockParams<T>): void => {
  runtime.notify("save", { state: "start" });
  $.post(saveUrl, JSON.stringify(data))
    .done(() => {
      runtime.notify("save", { state: "end" });
    })
    .fail((response) => {
      const message = typeof errorMessage === "function" ? errorMessage(response) : errorMessage;

      runtime.notify("error", {
        title: "Save Error",
        message: message,
      });
    });
};
