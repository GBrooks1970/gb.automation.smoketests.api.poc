import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { TokenDateParser } from '../../../../../src/tokenparser/TokenDateParser';

let tokenString: string;

const toApiProperty = (propertyName: string): string =>
    propertyName
        ? propertyName.charAt(0).toUpperCase() + propertyName.slice(1)
        : propertyName;

const formatDateUtc = (date: Date): string => {
    const iso = date.toISOString();
    return `${iso.slice(0, 19).replace('T', ' ')}Z`;
};

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
    const propertyKey = toApiProperty(propertyName);
    cy.get('@apiResponse').its(`body.${propertyKey}`).should('exist');

    let expectedValue = expected;

    if (expected !== 'Invalid string token format' && propertyKey === 'ParsedToken') {
        const parsedDate = TokenDateParser.parseDateStringToken(tokenString);
        expectedValue = formatDateUtc(parsedDate);
    }

    const assertType = propertyKey === 'ParsedToken' ? 'equal' : 'contain';

    cy.get('@apiResponse').its(`body.${propertyKey}`).should(assertType, expectedValue);
});
