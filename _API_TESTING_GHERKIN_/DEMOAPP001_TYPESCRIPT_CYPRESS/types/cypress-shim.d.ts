declare namespace Cypress {
  interface RequestOptions {
    method?: string;
    url?: string;
    body?: unknown;
    headers?: Record<string, unknown>;
    qs?: Record<string, unknown>;
    [key: string]: unknown;
  }

  interface Response<T = unknown> {
    body: T;
    status: number;
    headers: Record<string, unknown>;
  }

  interface Chainable<T = unknown> {
    then<TResult = T>(
      onfulfilled?: (value: T) => TResult | PromiseLike<TResult>,
    ): Chainable<TResult>;
  }

  function env(key: string): string | undefined;
  function config(key: string): string | undefined;
}

declare const cy: {
  request<T = unknown>(
    options: Partial<Cypress.RequestOptions> | string,
  ): Cypress.Chainable<Cypress.Response<T>>;
  wrap<S>(subject: S, options?: Record<string, unknown>): Cypress.Chainable<S>;
};

declare const expect: any;

declare const process: {
  env?: Record<string, string | undefined>;
};

declare module "@badeball/cypress-cucumber-preprocessor" {
  export function Before(...args: unknown[]): void;
  export function After(...args: unknown[]): void;
}
