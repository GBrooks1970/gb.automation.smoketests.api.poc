import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { SendGetRequest } from "../../../../screenplay/tasks/SendGetRequest";
import { ResponseStatus } from "../../../../screenplay/questions/ResponseStatus";
import { ResponseBody } from "../../../../screenplay/questions/ResponseBody";
import { TokenDateParser } from "../../../../src/tokenparser/TokenDateParser";
import { DateUtils } from "../../../../src/utils/date-utils";
import type { CustomWorld } from "../../../../screenplay/core/custom-world";

let tokenString = "";

const toApiProperty = (propertyName: string): string =>
  propertyName ? propertyName.charAt(0).toUpperCase() + propertyName.slice(1) : propertyName;

Given<CustomWorld>("a valid or invalid date token {string}", function (this, inputToken: string) {
  tokenString = inputToken;
});

When<CustomWorld>("a GET request is made to the ParseDateToken Endpoint", async function (this) {
  await this.actor.attemptsTo(SendGetRequest.to("/parse-date-token", { token: tokenString }));
});

Then<CustomWorld>(
  "the API response for the ParseDateToken Endpoint should return a status code of {int}",
  async function (this, statusCode: number) {
    const status = await this.actor.answer(ResponseStatus.code());
    expect(status).toBe(statusCode);
  },
);

Then<CustomWorld>(
  "the response body should contain {string} with the value {string}",
  async function (this, propertyName: string, expected: string) {
    const propertyKey = toApiProperty(propertyName);
    const body = await this.actor.answer(ResponseBody.json());
    expect(body[propertyKey]).toBeDefined();

    let expectedValue = expected;

    if (propertyKey === "ParsedToken" && expected !== "Invalid string token format") {
      const parsedDate = TokenDateParser.parseDateStringToken(tokenString);
      expectedValue = DateUtils.formatDateUtc(parsedDate);
      expect(body[propertyKey]).toBe(expectedValue);
      return;
    }

    expect(String(body[propertyKey])).toContain(expectedValue);
  },
);
