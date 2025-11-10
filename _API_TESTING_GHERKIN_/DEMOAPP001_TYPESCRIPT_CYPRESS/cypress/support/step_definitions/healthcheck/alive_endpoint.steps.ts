import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { expect } from "chai";
import { SendGetRequest } from "../../../../src/screenplay/tasks/SendGetRequest";
import { ResponseStatus } from "../../../../src/screenplay/questions/ResponseStatus";
import { ResponseBody } from "../../../../src/screenplay/questions/ResponseBody";
import { apiActor } from "../../screenplay/api-world";

Given("the API is available", () => {
  return apiActor().attemptsTo(SendGetRequest.to("/alive"));
});

When("a GET request is made to the Alive Endpoint", () => {
  return apiActor().attemptsTo(SendGetRequest.to("/alive"));
});

Then("the API response should return a status code of 200", () => {
  const status = apiActor().answer(ResponseStatus.code());
  expect(status).to.equal(200);
});

Then('the Health Check response body should contain "Status" with the value "ALIVE-AND-KICKING"', () => {
  const body = apiActor().answer(ResponseBody.json());
  expect(body.Status).to.equal("ALIVE-AND-KICKING");
});
