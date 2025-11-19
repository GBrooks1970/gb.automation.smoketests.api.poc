/// <reference path="../../types/cypress-shim.d.ts" />
import { Before, After } from "@badeball/cypress-cucumber-preprocessor";
import { Actor } from "../actors/Actor";
import { CallAnApi } from "../abilities/CallAnApi";

const apiBaseUrl = (): string =>
  Cypress.env("API_BASE_URL") ?? Cypress.config("baseUrl") ?? "http://localhost:3000";

let currentActor: Actor | null = null;

Before(() => {
  currentActor = Actor.named("Cypress API Actor").whoCan(CallAnApi.at(apiBaseUrl()));
});

After(() => {
  if (currentActor) {
    try {
      currentActor.abilityTo(CallAnApi).dispose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Failed to dispose CallAnApi ability:", error);
    }
  }
  currentActor = null;
});

export const apiActor = (): Actor => {
  if (!currentActor) {
    throw new Error("Cypress API Actor is not initialised. Ensure the Screenplay hooks have run.");
  }
  return currentActor;
};
