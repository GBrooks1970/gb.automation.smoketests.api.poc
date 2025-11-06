import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { SendGetRequest } from "../../../../screenplay/tasks/SendGetRequest";
import { ResponseStatus } from "../../../../screenplay/questions/ResponseStatus";
import { ResponseJson } from "../../../../screenplay/questions/ResponseJson";
import type { CustomWorld } from "../../../../screenplay/support/custom-world";

Given<CustomWorld>('the API is available', async function (this) {
  await this.actor.attemptsTo(SendGetRequest.to('/alive'));
  const status = await this.actor.answer(ResponseStatus.code());
  expect(status).toBe(200);
});

When<CustomWorld>('a GET request is made to the Alive Endpoint', async function (this) {
  await this.actor.attemptsTo(SendGetRequest.to('/alive'));
});

Then<CustomWorld>('the API response should return a status code of 200', async function (this) {
  const status = await this.actor.answer(ResponseStatus.code());
  expect(status).toBe(200);
});

Then<CustomWorld>('the Health Check response body should contain "Status" with the value "ALIVE-AND-KICKING"', async function (this) {
  const body = await this.actor.answer(ResponseJson.body());
  expect(body.Status).toBe('ALIVE-AND-KICKING');
});

