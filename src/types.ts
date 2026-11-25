export interface XBlockRuntime {
  handlerUrl: (element: Element | null, action: string) => string;
  notify: (action: string, data: object) => void;
}

export interface ThemeUrls {
  core: {
    urls: {
      default: string;
      brandOverride: string;
    };
  };
  defaults: {
    light: string;
    [key: string]: string;
  };
  variants: {
    [key: string]: {
      urls: {
        brandOverride: string;
      };
    };
  };
}

export interface ThemeConfig {
  version: string;
  urls: ThemeUrls;
}

export interface XBlockConfig {
  theme?: ThemeConfig | null;
}

export interface SaveStudioBlockParams<T = unknown> {
  saveUrl: string;
  data: T;
  runtime: XBlockRuntime;
  errorMessage?: string | ((response: unknown) => string);
}
