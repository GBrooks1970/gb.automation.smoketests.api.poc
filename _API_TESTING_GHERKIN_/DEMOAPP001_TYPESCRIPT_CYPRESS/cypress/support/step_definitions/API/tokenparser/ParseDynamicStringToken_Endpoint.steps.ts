import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { expect } from "chai";
import { SendGetRequest } from "../../../../../src/screenplay/tasks/SendGetRequest";
import { ResponseStatus } from "../../../../../src/screenplay/questions/ResponseStatus";
import { ResponseBody } from "../../../../../src/screenplay/questions/ResponseBody";
import { apiActor } from "../../../screenplay/api-world";

let token = "";

Given("the DynamicStringParser endpoint is running", () => {
  // Batch scripts ensure availability; no-op placeholder for readability.
});

When("A request with dynamic string token {string} to the DynamicStringParser endpoint", (inputToken: string) => {
  token = inputToken;
  return apiActor().attemptsTo(
    SendGetRequest.to("/parse-dynamic-string-token", {
      qs: { token },
      failOnStatusCode: false,
    })
  );
});

Then(
  "the API response should return a status code of {int} for the DynamicStringParser endpoint",
  (statusCode: number) => {
    const actualStatus = apiActor().answer(ResponseStatus.code());
    expect(actualStatus).to.equal(statusCode);
  }
);

Then("the response should contain {string} with the value {string}", (propertyName: string, expected: string) => {
  const body = apiActor().answer(ResponseBody.json());
  const propertyKey = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
  const parsedToken = body[propertyName] ?? body[propertyKey];

  switch (token) {
    case "INVALIDTOKEN": {
      expect(String(body.Error)).to.contain(expected);
      break;
    }
    case "[ALPHA-NUMERIC-5]": {
      expect(String(parsedToken)).to.match(/^[a-zA-Z0-9]{5}$/);
      break;
    }
    case "[PUNCTUATION-3]": {
      expect(String(parsedToken)).to.match(/^[!@#$%^&*(),.?":;{}|<>]{3}$/);
      break;
    }
    case "[ALPHA-NUMERIC-PUNCTUATION-10-LINES-2]": {
      const lines = String(parsedToken).split(/\r?\n/).filter((line) => line.length > 0);
      expect(lines.length).to.equal(2);
      lines.forEach((line) => {
        expect(line).to.match(/^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]{10}$/);
      });
      break;
    }
    default:
      throw new Error(`Unexpected token pattern: ${token}`);
  }
});
