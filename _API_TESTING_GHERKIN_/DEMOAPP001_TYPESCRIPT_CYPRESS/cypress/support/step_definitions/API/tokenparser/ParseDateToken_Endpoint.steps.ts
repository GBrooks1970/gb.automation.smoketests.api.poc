import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { expect } from "chai";
import { TokenDateParser } from "../../../../../src/tokenparser/TokenDateParser";
import { DateUtils } from "../../../../../src/utils/date-utils";
import { SendGetRequest } from "../../../../../screenplay/tasks/SendGetRequest";
import { ResponseStatus } from "../../../../../screenplay/questions/ResponseStatus";
import { ResponseBody } from "../../../../../screenplay/questions/ResponseBody";
import { apiActor } from "../../../../../screenplay/core/api-world";

const toApiProperty = (propertyName: string): string =>
  propertyName ? propertyName.charAt(0).toUpperCase() + propertyName.slice(1) : propertyName;

let tokenString = "";

Given("a valid or invalid date token {string}", (inputToken: string) => {
  tokenString = inputToken;
});

When("a GET request is made to the ParseDateToken Endpoint", () => {
  return apiActor().attemptsTo(
    SendGetRequest.to("/parse-date-token", {
      qs: { token: tokenString },
      failOnStatusCode: false,
    }),
  );
});

Then(
  "the API response for the ParseDateToken Endpoint should return a status code of {int}",
  (statusCode: number) => {
    const actualStatus = apiActor().answer(ResponseStatus.code());
    expect(actualStatus).to.equal(statusCode);
  },
);

Then(
  "the response body should contain {string} with the value {string}",
  (propertyName: string, expected: string) => {
    const propertyKey = toApiProperty(propertyName);
    const body = apiActor().answer(ResponseBody.json());
    expect(body[propertyKey]).to.not.equal(undefined);

    if (propertyKey === "ParsedToken" && expected !== "Invalid string token format") {
      const parsedDate = TokenDateParser.parseDateStringToken(tokenString);
      const expectedValue = DateUtils.formatDateUtc(parsedDate);
      expect(body[propertyKey]).to.equal(expectedValue);
      return;
    }

    expect(String(body[propertyKey])).to.contain(expected);
  },
);
