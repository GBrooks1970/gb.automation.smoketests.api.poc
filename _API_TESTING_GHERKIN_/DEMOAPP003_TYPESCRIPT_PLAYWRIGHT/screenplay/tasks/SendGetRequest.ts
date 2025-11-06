import type { APIResponse } from "@playwright/test";
import { CallAnApi } from "../abilities/CallAnApi";
import type { Task } from "../support/types";
import type { Actor } from "../actors/Actor";

export class SendGetRequest implements Task {
  private constructor(private readonly path: string, private readonly params?: Record<string, string>) {}

  static to(path: string, params?: Record<string, string>): SendGetRequest {
    return new SendGetRequest(path, params);
  }

  async performAs(actor: Actor): Promise<void> {
    const api = actor.abilityTo(CallAnApi);
    const response = await api.get(this.path, this.params);
    actor.remember<APIResponse>("last-response", response);
  }
}
