import type { Ability } from "../core/types";

export class CallAnApi implements Ability {
  constructor(private readonly baseUrl: string) {}

  static at(baseUrl: string): CallAnApi {
    return new CallAnApi(baseUrl);
  }

  get description(): string {
    return `Call API at ${this.baseUrl}`;
  }

  get(path: string, options?: Partial<Cypress.RequestOptions>): Cypress.Chainable<Cypress.Response<unknown>> {
    const requestOptions = {
      method: "GET",
      url: this.baseUrl ? `${this.baseUrl}${path}` : path,
      failOnStatusCode: false,
      ...options,
    };

    return cy.request(requestOptions);
  }
}
