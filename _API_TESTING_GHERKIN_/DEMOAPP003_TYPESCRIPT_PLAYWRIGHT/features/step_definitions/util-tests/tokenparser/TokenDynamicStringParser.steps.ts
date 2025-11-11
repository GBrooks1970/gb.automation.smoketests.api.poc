import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { UseTokenParsers } from "../../../../screenplay/abilities/UseTokenParsers";
import {
  LAST_GENERATED_STRING,
  LAST_PARSE_ERROR,
} from "../../../../screenplay/support/memory-keys";
import type { CustomWorld } from "../../../../screenplay/core/custom-world";
import { UtilActorMemory } from "../../../../screenplay/support/UtilActorMemory";

let token = "";

const parser = (world: CustomWorld) => world.actor.abilityTo(UseTokenParsers);

Given<CustomWorld>("a token {string}", function (this, inputToken: string) {
  token = inputToken;
});

When<CustomWorld>("I parse and generate the string", function (this) {
  UtilActorMemory.clearError(this);
  UtilActorMemory.rememberGenerated(this, "");
  try {
    const generated = parser(this).parseDynamicString(token);
    UtilActorMemory.rememberGenerated(this, generated);
  } catch (error) {
    UtilActorMemory.rememberError(this, error);
  }
});

Then<CustomWorld>("the generated string should have a length of {int}", function (this, expectedLength: number) {
  const error = UtilActorMemory.getParseError(this);
  expect(error, "Unexpected parsing error").toBeFalsy();
  const generated = UtilActorMemory.getGenerated(this).replace(/\r\n/g, "");
  expect(generated.length).toBe(expectedLength);
});

Then<CustomWorld>("the generated string should match the character set {string}", function (this, characterSet: string) {
  const error = UtilActorMemory.getParseError(this);
  expect(error, "Unexpected parsing error").toBeFalsy();
  const generated = UtilActorMemory.getGenerated(this);

  const regex = (() => {
    switch (characterSet) {
      case "ALPHA":
        return /^[A-Za-z\r\n]+$/;
      case "NUMERIC":
        return /^[0-9\r\n]+$/;
      case "ALPHA_NUMERIC":
        return /^[A-Za-z0-9\r\n]+$/;
      case "ALPHA_NUMERIC_PUNCTUATION":
        return /^[A-Za-z0-9.,!?;:\r\n]+$/;
      case "SPECIAL":
        return /^[!@#$%^&*()_+\[\]{}|;:,.<>?\r\n]+$/;
      case "ALPHA_PUNCTUATION":
        return /^[A-Za-z.,!?;:\r\n]+$/;
      case "PUNCTUATION":
        return /^[.,!?;:\r\n]+$/;
      case "SPECIAL_PUNCTUATION":
        return /^[!@#$%^&*()_+\[\]{}|;:,.<>?.,!?;:\r\n]+$/;
      case "ALPHA_NUMERIC_SPECIAL":
        return /^[A-Za-z0-9!@#$%^&*()_+\[\]{}|;:,.<>?\r\n]+$/;
      default:
        throw new Error(`Unknown character set: ${characterSet}`);
    }
  })();

  expect(generated).toMatch(regex);
});

Then<CustomWorld>("the generated string should have {int} lines", function (this, expectedLines: number) {
  const error = UtilActorMemory.getParseError(this);
  expect(error, "Unexpected parsing error").toBeFalsy();
  const lines = UtilActorMemory.getGenerated(this).split("\r\n");
  expect(lines.length).toBe(expectedLines);
});

Then<CustomWorld>("a dynamic string parser error should be thrown with message {string}", function (
  this,
  expectedMessage: string
) {
  const error = UtilActorMemory.getParseError(this);
  expect(error, "Expected parsing to fail").toBeTruthy();
  expect(error?.message ?? "").toContain(expectedMessage);
});
