import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { format, sub, add, set } from 'date-fns';

let tokenString: string;
let expectedValue: string;

Given('a valid or invalid date token {string}', (inputToken: string) => {
    tokenString = inputToken;
});

When('a GET request is made to the DateTokenParser Endpoint', () => {
    cy.request({
        method: 'GET',
        url: '/parse-date-token',
        qs: { token: tokenString },
        failOnStatusCode: false  // Prevent Cypress from failing on non-2xx responses
    }).as('apiResponse');
});

Then('the API response for the DateTokenParser Endpoint should return a status code of {int}', (statusCode: number) => {
    cy.get('@apiResponse').its('status').should('equal', statusCode);
});

Then('the response body should contain {string} with the value {string}', (propertyName: string, expected: string) => {
    cy.get('@apiResponse').its(`body.${propertyName}`).should('exist');

    // Generate expected values based on expected pattern
    // Set the base date with time zeroed out
    const today = set(new Date(), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
    switch (expected) {
        case 'today':
            expectedValue = format(today, 'yyyy-MM-dd HH:mm:ssX');
            break;
        case 'one year and one month ago from today':
            expectedValue = format(sub(today, { years: 1, months: 1 }), 'yyyy-MM-dd HH:mm:ssX');
            break;
        case 'one year ahead and two months ago from today':
            expectedValue = format(add(today, { years: 1, months: -2 }), 'yyyy-MM-dd HH:mm:ssX');
            break;
        default:
            expectedValue = 'Invalid string token format';
    }

    const assertType = propertyName === 'ParsedToken' ? 'equal' : 'contains';

    cy.get('@apiResponse').its(`body.${propertyName}`).should(assertType, expectedValue);
});
