import { APIRequestContext, APIResponse, request } from "@playwright/test";
import type { Ability } from "../core/types";

export class CallAnApi implements Ability {
  constructor(
    private readonly context: APIRequestContext,
    public readonly baseURL: string,
  ) {}

  static async at(baseURL: string): Promise<CallAnApi> {
    const context = await request.newContext({ baseURL });
    return new CallAnApi(context, baseURL);
  }

  get description(): string {
    return `Call API at ${this.baseURL}`;
  }

  async get(path: string, params?: Record<string, string>): Promise<APIResponse> {
    return this.context.get(path, { params });
  }

  async post(path: string, data?: unknown): Promise<APIResponse> {
    return this.context.post(path, { data });
  }

  async dispose(): Promise<void> {
    await this.context.dispose();
  }
}
