import type { Question } from "../support/types";
import type { Actor } from "../actors/Actor";
import type { APIResponse } from "@playwright/test";

export class ResponseStatus implements Question<number> {
  static code(): ResponseStatus {
    return new ResponseStatus();
  }

  answeredBy(actor: Actor): number {
    const response = actor.recall<APIResponse>("last-response");
    if (!response) {
      throw new Error("No response available for status assertion");
    }
    return response.status();
  }
}
