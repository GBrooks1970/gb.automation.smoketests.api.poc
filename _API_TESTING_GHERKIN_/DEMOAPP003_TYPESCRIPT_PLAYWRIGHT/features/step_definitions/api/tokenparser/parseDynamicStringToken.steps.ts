import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { SendGetRequest } from "../../../../screenplay/tasks/SendGetRequest";
import { ResponseStatus } from "../../../../screenplay/questions/ResponseStatus";
import { ResponseJson } from "../../../../screenplay/questions/ResponseJson";
import type { CustomWorld } from "../../../../screenplay/support/custom-world";

let token = "";

Given<CustomWorld>('the DynamicStringParser endpoint is running', function () {
  // Endpoint availability is ensured by the API server bootstrap (handled in batch script).
});

When<CustomWorld>('A request with dynamic string token {string} to the DynamicStringParser endpoint', async function (this, inputToken: string) {
  token = inputToken;
  await this.actor.attemptsTo(
    SendGetRequest.to('/parse-dynamic-string-token', { token })
  );
});

Then<CustomWorld>('the API response should return a status code of {int} for the DynamicStringParser endpoint', async function (this, statusCode: number) {
  const status = await this.actor.answer(ResponseStatus.code());
  expect(status).toBe(statusCode);
});

Then<CustomWorld>('the response should contain {string} with the value {string}', async function (this, propertyName: string, expected: string) {
  const body = await this.actor.answer(ResponseJson.body());
  const parsedToken = body[propertyName] ?? body[propertyName.charAt(0).toUpperCase() + propertyName.slice(1)];

  switch (token) {
    case 'INVALIDTOKEN': {
      expect(String(body.Error)).toContain(expected);
      break;
    }
    case '[ALPHA-NUMERIC-5]': {
      expect(String(parsedToken)).toMatch(/^[a-zA-Z0-9]{5}$/);
      break;
    }
    case '[PUNCTUATION-3]': {
      expect(String(parsedToken)).toMatch(/^[!@#$%^&*(),.?":;{}|<>]{3}$/);
      break;
    }
    case "[ALPHA-NUMERIC-PUNCTUATION-10-LINES-2]": {
      const lines = String(parsedToken).split(/\r?\n/).filter((line) => line.length > 0);
      expect(lines.length).toBe(2);
      for (const line of lines) {
        expect(line).toMatch(/^[a-zA-Z0-9!@#$%^&*(),.?":;{}|<>]{10}$/);
      }
      break;
    }
    default:
      throw new Error(`Unexpected token pattern: ${token}`);
  }
});
