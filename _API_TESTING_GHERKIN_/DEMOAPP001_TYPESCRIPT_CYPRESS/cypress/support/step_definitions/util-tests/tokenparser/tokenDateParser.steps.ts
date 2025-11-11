import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { expect } from "chai";
import CommonUtils from "../../../../../src/services/common-utils";
import { utilActor } from "../../../../../screenplay/core/util-world";
import { UseTokenParsers } from "../../../../../screenplay/abilities/UseTokenParsers";
import { UtilActorMemory } from "../../../../../screenplay/support/UtilActorMemory";
import {
  LAST_PARSED_DATE,
  SECONDARY_PARSED_DATE,
} from "../../../../../screenplay/support/memory-keys";

let token = "";
let dateStringToken = "";
let dateRangeTokenString = "";

const parser = () => utilActor().abilityTo(UseTokenParsers);

function getStartDateUTC(): Date {
  const now = new Date();
  const startDateUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
  );
  console.log(`TEST: StartDateUTC: ${CommonUtils.toJSONString(startDateUTC)}`);
  return startDateUTC;
}

Given("A date token {string}", (inputToken: string) => {
  token = inputToken;
});

Given("An invalid date range string {string}", (inputToken: string) => {
  token = inputToken;
  dateRangeTokenString = inputToken;
});

When("I parse the token", () => {
  UtilActorMemory.rememberDate(LAST_PARSED_DATE, new Date(0));
  UtilActorMemory.clearError();
  try {
    const parsed = parser().parseDateToken(token);
    UtilActorMemory.rememberDate(LAST_PARSED_DATE, parsed);
  } catch (error) {
    UtilActorMemory.rememberError(error);
  }
});

Then("an error should be thrown with message {string}", (expectedMessage: string) => {
  const error = UtilActorMemory.getParseError();
  expect(error, "Expected parsing to throw an error.").to.exist;
  expect(error?.message ?? "").to.contain(expectedMessage);
});

const compareWithExpected = (adjuster: (date: Date) => void) => {
  const result = UtilActorMemory.getRememberedDate(LAST_PARSED_DATE);
  const expectedDate = getStartDateUTC();
  adjuster(expectedDate);
  console.log(
    `TOKEN ${token} : PARSED ${CommonUtils.toJSONString(result)} : EXPECTED ${CommonUtils.toJSONString(expectedDate)}`,
  );
  expect(result.toUTCString()).to.equal(expectedDate.toUTCString());
};

Then("the result should be today's date minus two year and four month", () => {
  compareWithExpected((expected) => {
    expected.setUTCFullYear(expected.getUTCFullYear() - 2);
    expected.setUTCMonth(expected.getUTCMonth() - 4);
  });
});

Then("the result should be today's date minus one year and one month", () => {
  compareWithExpected((expected) => {
    expected.setUTCFullYear(expected.getUTCFullYear() - 1);
    expected.setUTCMonth(expected.getUTCMonth() - 1);
  });
});

Then("the result should be today's date", () => {
  compareWithExpected(() => undefined);
});

Then("the result should be tomorrow's date", () => {
  compareWithExpected((expected) => {
    expected.setUTCDate(expected.getUTCDate() + 1);
  });
});

Then("the result should be yesterday's date", () => {
  compareWithExpected((expected) => {
    expected.setUTCDate(expected.getUTCDate() - 1);
  });
});

Then("the result should be today's date minus two years", () => {
  compareWithExpected((expected) => {
    expected.setUTCFullYear(expected.getUTCFullYear() - 2);
  });
});

Then("the result should be today's date minus one year, two months, and three days", () => {
  compareWithExpected((expected) => {
    expected.setUTCFullYear(expected.getUTCFullYear() - 1);
    expected.setUTCMonth(expected.getUTCMonth() - 2);
    expected.setUTCDate(expected.getUTCDate() - 3);
  });
});

Then("the result should be today's date plus one year, minus one month, and plus one day", () => {
  compareWithExpected((expected) => {
    expected.setUTCFullYear(expected.getUTCFullYear() + 1);
    expected.setUTCMonth(expected.getUTCMonth() - 1);
    expected.setUTCDate(expected.getUTCDate() + 1);
  });
});

Then("the result should be today's date plus two years", () => {
  compareWithExpected((expected) => {
    expected.setUTCFullYear(expected.getUTCFullYear() + 2);
  });
});

Then("the result should be today's date plus five months", () => {
  compareWithExpected((expected) => {
    expected.setUTCMonth(expected.getUTCMonth() + 5);
  });
});

Then("the result should be tomorrow's date plus five months", () => {
  compareWithExpected((expected) => {
    expected.setUTCDate(expected.getUTCDate() + 1);
    expected.setUTCMonth(expected.getUTCMonth() + 5);
  });
});

Then("the result should be yesterday's date plus five months and minus one year", () => {
  compareWithExpected((expected) => {
    expected.setUTCDate(expected.getUTCDate() - 1);
    expected.setUTCMonth(expected.getUTCMonth() + 5);
    expected.setUTCFullYear(expected.getUTCFullYear() - 1);
  });
});

Then(
  "the result should equal today plus {int} years {int} months {int} days",
  (years: number, months: number, days: number) => {
    compareWithExpected((expected) => {
      expected.setUTCFullYear(expected.getUTCFullYear() + years);
      expected.setUTCMonth(expected.getUTCMonth() + months);
      expected.setUTCDate(expected.getUTCDate() + days);
    });
  },
);

Given("A null or invalid date token", () => {
  token = "INVALID";
});

Then("the result should be the Unix zero date", () => {
  const result = UtilActorMemory.getRememberedDate(LAST_PARSED_DATE);
  const expectedDate = new Date(0);
  expectedDate.setHours(0, 0, 0, 0);
  console.log(
    `TOKEN ${token} : PARSED ${CommonUtils.toJSONString(result)} : EXPECTED ${CommonUtils.toJSONString(expectedDate)}`,
  );
  expect(result.toUTCString()).to.equal(expectedDate.toUTCString());
});

Given("A date string {string}", (input: string) => {
  dateStringToken = input;
});

When("I parse the date string token", () => {
  UtilActorMemory.clearError();
  try {
    const parsed = parser().parseDateStringToken(dateStringToken);
    UtilActorMemory.rememberDate(SECONDARY_PARSED_DATE, parsed);
  } catch (error) {
    UtilActorMemory.rememberError(error);
  }
});

Then("the result should be {string}", (expectedDateStr: string) => {
  const parsedDate = UtilActorMemory.getRememberedDate(SECONDARY_PARSED_DATE);
  const [year, month, day] = expectedDateStr.split("-").map(Number);
  const expectedDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  console.log(
    `TOKEN ${dateStringToken} : PARSED ${CommonUtils.toJSONString(parsedDate)} : EXPECTED ${CommonUtils.toJSONString(
      expectedDate,
    )}`,
  );
  expect(parsedDate.toUTCString()).to.equal(expectedDate.toUTCString());
});

Given("A date range string {string}", (input: string) => {
  dateRangeTokenString = input;
});

When("I parse the date range string", () => {
  UtilActorMemory.clearError();
  try {
    const range = parser().parseDateRangeToken(dateRangeTokenString);
    UtilActorMemory.rememberRange(range);
  } catch (error) {
    UtilActorMemory.rememberError(error);
  }
});

Then(
  "the start date should be {string} and the end date should be {string}",
  (startDate: string, endDate: string) => {
    const range = UtilActorMemory.getRange();
    const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
    const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
    const expectedStart = new Date(Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0, 0));
    const expectedEnd = new Date(Date.UTC(endYear, endMonth - 1, endDay, 0, 0, 0, 0));

    console.log(
      `TOKEN RANGE ${dateRangeTokenString} : PARSED ${CommonUtils.toJSONString(range)} : EXPECTED START ${CommonUtils.toJSONString(
        expectedStart,
      )} : EXPECTED END ${CommonUtils.toJSONString(expectedEnd)}`,
    );

    expect(range.Start.toUTCString()).to.equal(expectedStart.toUTCString());
    expect(range.End.toUTCString()).to.equal(expectedEnd.toUTCString());
  },
);
