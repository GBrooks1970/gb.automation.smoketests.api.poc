import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { SendGetRequest } from "../../../../screenplay/tasks/SendGetRequest";
import { ResponseStatus } from "../../../../screenplay/questions/ResponseStatus";
import { ResponseBody } from "../../../../screenplay/questions/ResponseBody";
import type { CustomWorld } from "../../../../screenplay/core/custom-world";

let token = "";

const CHARSETS = {
  alphaNumeric: /^[a-zA-Z0-9]+$/,
  punctuation: /^[.,!?;:]+$/,
  alphaNumericPunctuation: /^[a-zA-Z0-9.,!?;:]+$/,
  alphaNumericSpecial: /^[a-zA-Z0-9!@#$%^&*()_+\[\]{}|;:,.<>?]+$/,
  special: /^[!@#$%^&*()_+\[\]{}|;:,.<>?]+$/,
};

const getLines = (value: unknown) =>
  String(value)
    .split(/\r?\n/)
    .filter((line) => line.length > 0);
const expectMatchesCharset = (value: unknown, charset: RegExp, length?: number) => {
  const actual = String(value);
  if (length !== undefined) {
    expect(actual.length).toBe(length);
  }
  expect(actual).toMatch(charset);
};

Given<CustomWorld>("the ParseDynamicStringToken endpoint is running", function () {
  // Endpoint availability is ensured by the API server bootstrap (handled in batch script).
});

When<CustomWorld>(
  "A request with dynamic string token {string} to the ParseDynamicStringToken endpoint",
  async function (this: CustomWorld, inputToken: string) {
    token = inputToken;
    await this.actor.attemptsTo(SendGetRequest.to("/parse-dynamic-string-token", { token }));
  },
);

Then<CustomWorld>(
  "the API response should return a status code of {int} for the ParseDynamicStringToken endpoint",
  async function (this: CustomWorld, statusCode: number) {
    const status = await this.actor.answer(ResponseStatus.code());
    expect(status).toBe(statusCode);
  },
);

Then<CustomWorld>(
  "the response should contain {string} with the value {string}",
  async function (this: CustomWorld, propertyName: string, expected: string) {
    const body = await this.actor.answer(ResponseBody.json());
    const parsedToken =
      body[propertyName] ?? body[propertyName.charAt(0).toUpperCase() + propertyName.slice(1)];

    switch (token) {
      case "INVALIDTOKEN": {
        expect(String(body.Error)).toContain(expected);
        break;
      }
      case "[ALPHA-NUMERIC-5]":
        expectMatchesCharset(parsedToken, CHARSETS.alphaNumeric, 5);
        break;
      case "[PUNCTUATION-3]":
        expectMatchesCharset(parsedToken, CHARSETS.punctuation, 3);
        break;
      case "[ALPHA-NUMERIC-PUNCTUATION-10-LINES-2]": {
        const lines = getLines(parsedToken);
        expect(lines.length).toBe(2);
        for (const line of lines) {
          expectMatchesCharset(line, CHARSETS.alphaNumericPunctuation, 10);
        }
        break;
      }
      case "[NUMERIC-8]":
        expectMatchesCharset(parsedToken, /^\d+$/, 8);
        break;
      case "[SPECIAL-5-LINES-3]": {
        const lines = getLines(parsedToken);
        expect(lines.length).toBe(3);
        for (const line of lines) {
          expectMatchesCharset(line, CHARSETS.special, 5);
        }
        break;
      }
      case "[ALPHA-NUMERIC-SPECIAL-12]":
        expectMatchesCharset(parsedToken, CHARSETS.alphaNumericSpecial, 12);
        break;
      default:
        throw new Error(`Unexpected token pattern: ${token}`);
    }
  },
);
