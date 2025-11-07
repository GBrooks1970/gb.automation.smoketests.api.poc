import type { Task } from "../core/types";
import type { Actor } from "../actors/Actor";
import { CallAnApi } from "../abilities/CallAnApi";
import { LAST_RESPONSE } from "../support/memory-keys";

export class SendGetRequest implements Task {
  private constructor(
    private readonly path: string,
    private readonly options?: Partial<Cypress.RequestOptions>
  ) {}

  static to(path: string, options?: Partial<Cypress.RequestOptions>): SendGetRequest {
    return new SendGetRequest(path, options);
  }

  performAs(actor: Actor): Cypress.Chainable<unknown> {
    const api = actor.abilityTo(CallAnApi);
    return api.get(this.path, this.options).then((response: Cypress.Response<unknown>) => {
      actor.remember(LAST_RESPONSE, response);
      return response as unknown;
    });
  }
}
