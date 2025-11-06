import type { Question } from "../support/types";
import type { Actor } from "../actors/Actor";
import type { APIResponse } from "@playwright/test";

export class ResponseJson implements Question<Record<string, unknown>> {
  static body(): ResponseJson {
    return new ResponseJson();
  }

  async answeredBy(actor: Actor): Promise<Record<string, unknown>> {
    const response = actor.recall<APIResponse>("last-response");
    if (!response) {
      throw new Error("No response available for body assertion");
    }
    return (await response.json()) as Record<string, unknown>;
  }
}
