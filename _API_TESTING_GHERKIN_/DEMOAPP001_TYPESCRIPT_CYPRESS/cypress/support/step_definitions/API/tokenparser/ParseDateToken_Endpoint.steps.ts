import { Given, When, Then, Before } from "@badeball/cypress-cucumber-preprocessor";
import { expect } from "chai";
import { TokenDateParser } from "../../../../../src/tokenparser/TokenDateParser";
import { Actor } from "../../../../../src/screenplay/actors/Actor";
import { CallAnApi } from "../../../../../src/screenplay/abilities/CallAnApi";
import { SendGetRequest } from "../../../../../src/screenplay/tasks/SendGetRequest";
import { ResponseStatus } from "../../../../../src/screenplay/questions/ResponseStatus";
import { ResponseBody } from "../../../../../src/screenplay/questions/ResponseBody";

const toApiProperty = (propertyName: string): string =>
  propertyName ? propertyName.charAt(0).toUpperCase() + propertyName.slice(1) : propertyName;

const formatDateUtc = (date: Date): string => {
  const iso = date.toISOString();
  return `${iso.slice(0, 19).replace("T", " ")}Z`;
};

const apiBaseUrl = (): string => Cypress.env("API_BASE_URL") ?? Cypress.config("baseUrl") ?? "http://localhost:3000";

let actor: Actor;
let tokenString = "";

Before(() => {
  actor = Actor.named("Cypress API Tester").whoCan(CallAnApi.at(apiBaseUrl()));
});

Given("a valid or invalid date token {string}", (inputToken: string) => {
  tokenString = inputToken;
});

When("a GET request is made to the DateTokenParser Endpoint", () => {
  return actor.attemptsTo(
    SendGetRequest.to("/parse-date-token", {
      qs: { token: tokenString },
      failOnStatusCode: false,
    })
  );
});

Then("the API response for the DateTokenParser Endpoint should return a status code of {int}", (statusCode: number) => {
  const actualStatus = actor.answer(ResponseStatus.code());
  expect(actualStatus).to.equal(statusCode);
});

Then("the response body should contain {string} with the value {string}", (propertyName: string, expected: string) => {
  const propertyKey = toApiProperty(propertyName);
  const body = actor.answer(ResponseBody.json());
  expect(body[propertyKey]).to.not.equal(undefined);

  if (propertyKey === "ParsedToken" && expected !== "Invalid string token format") {
    const parsedDate = TokenDateParser.parseDateStringToken(tokenString);
    const expectedValue = formatDateUtc(parsedDate);
    expect(body[propertyKey]).to.equal(expectedValue);
    return;
  }

  expect(String(body[propertyKey])).to.contain(expected);
});
