import type { Question } from "../core/types";
import type { Actor } from "../actors/Actor";
import { LAST_RESPONSE } from "../support/memory-keys";

export class ResponseStatus implements Question<number> {
  static code(): ResponseStatus {
    return new ResponseStatus();
  }

  answeredBy(actor: Actor): number {
    const response = actor.recall<Cypress.Response<unknown>>(LAST_RESPONSE);
    if (!response) {
      throw new Error("No response available for status assertion");
    }
    return response.status;
  }
}
