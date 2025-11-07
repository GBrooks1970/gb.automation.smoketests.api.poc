import { Before, Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { expect } from "chai";
import { Actor } from "../../../../src/screenplay/actors/Actor";
import { CallAnApi } from "../../../../src/screenplay/abilities/CallAnApi";
import { SendGetRequest } from "../../../../src/screenplay/tasks/SendGetRequest";
import { ResponseStatus } from "../../../../src/screenplay/questions/ResponseStatus";
import { ResponseBody } from "../../../../src/screenplay/questions/ResponseBody";

const apiBaseUrl = (): string => Cypress.env("API_BASE_URL") ?? Cypress.config("baseUrl") ?? "http://localhost:3000";

let actor: Actor;

Before(() => {
  actor = Actor.named("Cypress Healthcheck Tester").whoCan(CallAnApi.at(apiBaseUrl()));
});

Given("the API is available", () => {
  return actor.attemptsTo(SendGetRequest.to("/alive"));
});

When("a GET request is made to the Alive Endpoint", () => {
  return actor.attemptsTo(SendGetRequest.to("/alive"));
});

Then("the API response should return a status code of 200", () => {
  const status = actor.answer(ResponseStatus.code());
  expect(status).to.equal(200);
});

Then('the Health Check response body should contain "Status" with the value "ALIVE-AND-KICKING"', () => {
  const body = actor.answer(ResponseBody.json());
  expect(body.Status).to.equal("ALIVE-AND-KICKING");
});
