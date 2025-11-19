/// <reference path="../../types/cypress-shim.d.ts" />
import { Before, After } from "@badeball/cypress-cucumber-preprocessor";
import { Actor } from "../actors/Actor";
import { UseTokenParsers } from "../abilities/UseTokenParsers";

let currentActor: Actor | null = null;

Before({ tags: "@UTILTEST" }, () => {
  currentActor = Actor.named("Cypress Util Actor").whoCan(new UseTokenParsers());
});

After({ tags: "@UTILTEST" }, () => {
  currentActor = null;
});

export const utilActor = (): Actor => {
  if (!currentActor) {
    throw new Error(
      "Cypress Util Actor is not initialised. Ensure the @UTILTEST hooks have executed.",
    );
  }
  return currentActor;
};
