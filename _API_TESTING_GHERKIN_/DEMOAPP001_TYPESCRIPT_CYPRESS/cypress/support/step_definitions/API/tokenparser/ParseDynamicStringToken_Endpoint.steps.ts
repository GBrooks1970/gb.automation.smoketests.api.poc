import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { expect } from "chai";
import { SendGetRequest } from "../../../../../screenplay/tasks/SendGetRequest";
import { ResponseStatus } from "../../../../../screenplay/questions/ResponseStatus";
import { ResponseBody } from "../../../../../screenplay/questions/ResponseBody";
import { apiActor } from "../../../../../screenplay/core/api-world";

let token = "";

const CHARSETS = {
  alphaNumeric: /^[a-zA-Z0-9]+$/,
  punctuation: /^[.,!?;:]+$/,
  special: /^[!@#$%^&*()_+\[\]{}|;:,.<>?]+$/,
  alphaNumericPunctuation: /^[a-zA-Z0-9.,!?;:]+$/,
  alphaNumericSpecial: /^[a-zA-Z0-9!@#$%^&*()_+\[\]{}|;:,.<>?]+$/,
};

const getLines = (value: unknown) =>
  String(value)
    .split(/\r?\n/)
    .filter((line) => line.length > 0);
const expectMatchesCharset = (value: unknown, charset: RegExp, length?: number) => {
  const actual = String(value);
  if (length !== undefined) {
    expect(actual.length).to.equal(length);
  }
  expect(actual).to.match(charset);
};

Given("the ParseDynamicStringToken endpoint is running", () => {
  // Batch scripts ensure availability; no-op placeholder for readability.
});

When(
  "A request with dynamic string token {string} to the ParseDynamicStringToken endpoint",
  (inputToken: string) => {
    token = inputToken;
    return apiActor().attemptsTo(
      SendGetRequest.to("/parse-dynamic-string-token", {
        qs: { token },
        failOnStatusCode: false,
      }),
    );
  },
);

Then(
  "the API response should return a status code of {int} for the ParseDynamicStringToken endpoint",
  (statusCode: number) => {
    const actualStatus = apiActor().answer(ResponseStatus.code());
    expect(actualStatus).to.equal(statusCode);
  },
);

Then(
  "the response should contain {string} with the value {string}",
  (propertyName: string, expected: string) => {
    const body = apiActor().answer(ResponseBody.json());
    const propertyKey = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
    const parsedToken = body[propertyName] ?? body[propertyKey];

    switch (token) {
      case "INVALIDTOKEN": {
        expect(String(body.Error)).to.contain(expected);
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
        expect(lines.length).to.equal(2);
        lines.forEach((line) => {
          expectMatchesCharset(line, CHARSETS.alphaNumericPunctuation, 10);
        });
        break;
      }
      case "[NUMERIC-8]":
        expectMatchesCharset(parsedToken, /^\d+$/, 8);
        break;
      case "[SPECIAL-5-LINES-3]": {
        const lines = getLines(parsedToken);
        expect(lines.length).to.equal(3);
        lines.forEach((line) => {
          expectMatchesCharset(line, CHARSETS.special, 5);
        });
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
