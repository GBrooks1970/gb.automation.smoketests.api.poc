/// <reference types="cypress" />
import { Before, After } from "@badeball/cypress-cucumber-preprocessor";
import { Actor } from "../../../src/screenplay/actors/Actor";
import { CallAnApi } from "../../../src/screenplay/abilities/CallAnApi";

const apiBaseUrl = (): string => Cypress.env("API_BASE_URL") ?? Cypress.config("baseUrl") ?? "http://localhost:3000";

let currentActor: Actor | null = null;

Before(() => {
  currentActor = Actor.named("Cypress API Actor").whoCan(CallAnApi.at(apiBaseUrl()));
});

After(() => {
  currentActor = null;
});

export const apiActor = (): Actor => {
  if (!currentActor) {
    throw new Error("Cypress API Actor is not initialised. Ensure the Screenplay hooks have run.");
  }
  return currentActor;
};
