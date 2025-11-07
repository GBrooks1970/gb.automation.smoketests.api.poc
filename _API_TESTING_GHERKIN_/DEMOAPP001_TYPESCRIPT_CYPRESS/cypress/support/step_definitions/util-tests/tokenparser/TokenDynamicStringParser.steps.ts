import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { expect } from "chai";
import { TokenDynamicStringParser } from "../../../../../src/tokenparser/TokenDynamicStringParser";
import CommonUtils from "../../../../../src/services/common-utils";

let generatedString: string;
let token: string;
let parseError: Error | null;

Given('a token {string}', (inputToken: string) => {
    token = inputToken;
});

When("I parse and generate the string", () => {
    generatedString = "";
    parseError = null;

    try {
        generatedString = TokenDynamicStringParser.parseAndGenerate(token);
    } catch (error) {
        parseError = error as Error;
    }
});

Then('the generated string should have a length of {int}', (expectedLength: number) => {
    expect(parseError).to.be.null;
    expect(generatedString.replace(/\r\n/g, '').length).to.equal(expectedLength);
});

Then('the generated string should match the character set {string}', (characterSet: string) => {
    expect(parseError).to.be.null;
    let regex: RegExp;
    switch (characterSet) {
        case 'ALPHA':
            regex = /^[A-Za-z\r\n]+$/;
            break;
        case 'NUMERIC':
            regex = /^[0-9\r\n]+$/;
            break;
        case 'ALPHA_NUMERIC':
            regex = /^[A-Za-z0-9\r\n]+$/;
            break;
        case 'ALPHA_NUMERIC_PUNCTUATION':
            regex = /^[A-Za-z0-9.,!?;:\r\n]+$/;
            break;
        case 'SPECIAL':
            regex = /^[!@#$%^&*()_+\[\]{}|;:,.<>?\r\n]+$/;
            break;
        case 'ALPHA_PUNCTUATION':
            regex = /^[A-Za-z.,!?;:\r\n]+$/;
            break;
        case 'PUNCTUATION':
            regex = /^[.,!?;:\r\n]+$/;
            break;
        case 'SPECIAL_PUNCTUATION':
            regex = /^[!@#$%^&*()_+\[\]{}|;:,.<>?.,!?;:\r\n]+$/;
            break;
        case 'ALPHA_NUMERIC_SPECIAL':
            regex = /^[A-Za-z0-9!@#$%^&*()_+\[\]{}|;:,.<>?\r\n]+$/;
            break;
        default:
            throw new Error(`Unknown character set: ${characterSet}`);
    }
    expect(generatedString).to.match(regex);
});

Then('the generated string should have {int} lines', (expectedLines: number) => {
    expect(parseError).to.be.null;
    const lines = generatedString.split('\r\n');
    expect(lines).to.have.length(expectedLines);
});

Then('a dynamic string parser error should be thrown with message {string}', (expectedMessage: string) => {
    expect(parseError).to.not.be.null;
    expect(parseError?.message ?? "").to.contain(expectedMessage);
});

