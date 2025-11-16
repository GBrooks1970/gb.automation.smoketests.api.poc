import type { Question } from "../core/types";
import type { Actor } from "../actors/Actor";
import { LAST_RESPONSE } from "../support/memory-keys";

export class ResponseBody implements Question<Record<string, unknown>> {
  static json(): ResponseBody {
    return new ResponseBody();
  }

  answeredBy(actor: Actor): Record<string, unknown> {
    const response = actor.recall<Cypress.Response<unknown>>(LAST_RESPONSE);
    if (!response) {
      throw new Error("No response available for body assertion");
    }
    return response.body as Record<string, unknown>;
  }
}
