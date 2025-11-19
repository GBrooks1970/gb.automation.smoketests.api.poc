declare type CustomWorld = any;

declare module "@cucumber/cucumber" {
  export type StepDefinition = (...args: any[]) => unknown | Promise<unknown>;

  export function Given<TWorld = unknown>(
    expression: string | RegExp,
    implementation: StepDefinition,
  ): void;

  export function When<TWorld = unknown>(
    expression: string | RegExp,
    implementation: StepDefinition,
  ): void;

  export function Then<TWorld = unknown>(
    expression: string | RegExp,
    implementation: StepDefinition,
  ): void;

  export function Before<TWorld = unknown>(implementation: StepDefinition): void;
  export function After<TWorld = unknown>(implementation: StepDefinition): void;

  export interface IWorldOptions {
    parameters?: Record<string, unknown>;
  }

  export function setWorldConstructor<T>(world: new (options: IWorldOptions) => T): void;
  export function setDefaultTimeout(timeout: number): void;
}

declare module "@playwright/test" {
  export interface APIResponse {
    status(): number;
    json(): Promise<unknown>;
    text(): Promise<string>;
    headers(): Record<string, string>;
  }

  export interface APIRequestContext {
    get(url: string, options?: unknown): Promise<APIResponse>;
    post(url: string, options?: unknown): Promise<APIResponse>;
    dispose(): Promise<void>;
  }

  export const request: {
    newContext(options?: unknown): Promise<APIRequestContext>;
  };

  export const expect: {
    (value: unknown): {
      toBe(expected: unknown): void;
      toEqual(expected: unknown): void;
      toContain(expected: unknown): void;
      toMatch(expected: RegExp | string): void;
      toHaveProperty(property: string, value?: unknown): void;
      toBeTruthy(): void;
      toBeFalsy(): void;
      toBeDefined(): void;
    };
  };

  export function defineConfig(config: unknown): unknown;
  export const devices: Record<string, Record<string, unknown>>;
}
