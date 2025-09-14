import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

let token: string;
let expectedValue: string;
let response: Cypress.Response;

Given('the DynamicStringParser endpoint is running', () => {
  // Assume the endpoint is running as part of the setup
});

When('A request with dynamic string token {string} to the DynamicStringParser endpoint', (inputToken: string) => {
  token = inputToken;

  cy.request({
    method: 'GET',
    url: '/Parse-dynamic-string-token',
    qs: { token },
    failOnStatusCode: false  // Allows handling non-200 status codes in the test
  }).as('apiResponse');
});

Then('the API response should return a status code of {int} for the DynamicStringParser endpoint', (statusCode: number) => {
  cy.get('@apiResponse').its('status').should('equal', statusCode);
});

Then('the response should contain {string} with the value {string}', (propertyName: string, expected: string) => {
  cy.get('@apiResponse').then((apiResponse) => {
    // Customize the expectations based on the token structure.
    switch (token) {
      case 'INVALIDTOKEN':
        expect(apiResponse.body.Error).to.contain(expected);
        break;
      case '[ALPHA-NUMERIC-5]':
        expect(apiResponse.body.ParsedToken).to.match(/^[a-zA-Z0-9]{5}$/);
        break;
      case '[PUNCTUATION-3]':
        expect(apiResponse.body.ParsedToken).to.match(/^[!@#$%^&*(),.?":;{}|<>]{3}$/);
        break;
      case '[ALPHA-NUMERIC-PUNCTUATION-10-LINES-2]':
        const lines = apiResponse.body.ParsedToken.split('\r\n');
        expect(lines.length).to.equal(2);
        lines.forEach(line => {
          expect(line).to.match(/^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]{10}$/);
        });
        break;
      default:
        throw new Error('Unexpected token pattern');
    }
  }); 
});
