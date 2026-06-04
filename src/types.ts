export interface XBlockRuntime {
  handlerUrl: (element: Element | null, action: string) => string;
  notify: (action: string, data: object) => void;
}

export interface XBlockConfig {
  mfe_config_api: string;
}

export interface SaveStudioBlockParams<T = unknown> {
  saveUrl: string;
  data: T;
  runtime: XBlockRuntime;
  errorMessage?: string | ((response: unknown) => string);
}
