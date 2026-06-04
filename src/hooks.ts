import { useContext } from "react";
import { RuntimeContext } from "./context.ts";

// Returns the URL for the given XBlock handler name, bound to the current runtime and element.
export const useHandlerUrl = (handlerName: string) => {
  const context = useContext(RuntimeContext);
  return context.runtime.handlerUrl(context.element, handlerName);
};
