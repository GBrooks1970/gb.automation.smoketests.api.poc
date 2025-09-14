import { Given, When, Then, Before, After } from "@badeball/cypress-cucumber-preprocessor";

Given('the API is available', () => {
  cy.request('/alive').its('status').should('eq', 200);
});

When('a GET request is made to the Alive Endpoint', () => {
  cy.request('/alive').as('healthCheckResponse');
});

Then('the API response should return a status code of 200', () => {
  cy.get('@healthCheckResponse').its('status').should('eq', 200);
});

Then('the Health Check response body should contain "Status" with the value "ALIVE-AND-KICKING"', () => {
  cy.get('@healthCheckResponse').its('body.Status').should('eq', 'ALIVE-AND-KICKING');
});
