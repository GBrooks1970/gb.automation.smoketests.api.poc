import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { expect } from "chai";
import { utilActor } from "../../../screenplay/util-world";
import { UseTokenParsers } from "../../../../../src/screenplay/abilities/UseTokenParsers";
import { UtilActorMemory } from "../../step_utils/UtilActorMemory";

let token = "";

const parser = () => utilActor().abilityTo(UseTokenParsers);


Given("a token {string}", (inputToken: string) => {
  token = inputToken;
});

When("I parse and generate the string", () => {
  UtilActorMemory.rememberGenerated("");
  UtilActorMemory.clearError();
  try {
    const generated = parser().parseDynamicString(token);
    UtilActorMemory.rememberGenerated(generated);
  } catch (error) {
    UtilActorMemory.rememberError(error);
  }
});

Then("the generated string should have a length of {int}", (expectedLength: number) => {
  const error = UtilActorMemory.getParseError();
  expect(error, "Unexpected parser error").to.be.undefined;
  const generated = UtilActorMemory.getGenerated().replace(/\r\n/g, "");
  expect(generated.length).to.equal(expectedLength);
});

Then("the generated string should match the character set {string}", (characterSet: string) => {
  const error = UtilActorMemory.getParseError();
  expect(error, "Unexpected parser error").to.be.undefined;
  const generated = UtilActorMemory.getGenerated();

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

  expect(generated).to.match(regex);
});

Then("the generated string should have {int} lines", (expectedLines: number) => {
  const error = UtilActorMemory.getParseError();
  expect(error, "Unexpected parser error").to.be.undefined;
  const lines = UtilActorMemory.getGenerated().split("\r\n");
  expect(lines).to.have.length(expectedLines);
});

Then("a dynamic string parser error should be thrown with message {string}", (expectedMessage: string) => {
  const error = UtilActorMemory.getParseError();
  expect(error, "Expected parsing to fail").to.exist;
  expect(error?.message ?? "").to.contain(expectedMessage);
});
