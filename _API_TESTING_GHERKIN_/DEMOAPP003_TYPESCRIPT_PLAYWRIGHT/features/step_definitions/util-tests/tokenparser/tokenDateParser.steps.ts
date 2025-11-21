import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import CommonUtils from "tokenparser-api-shared/services/common-utils";
import { UseTokenParsers } from "../../../../screenplay/abilities/UseTokenParsers";
import {
  LAST_PARSED_DATE,
  SECONDARY_PARSED_DATE,
} from "../../../../screenplay/support/memory-keys";
import type { CustomWorld } from "../../../../screenplay/core/custom-world";
import { UtilActorMemory } from "../../../../screenplay/support/UtilActorMemory";

let token = "";
let dateStringToken = "";
let dateRangeTokenString = "";

const parser = (world: CustomWorld) => world.actor.abilityTo(UseTokenParsers);

const getStartDateUTC = (): Date => {
  const now = new Date();
  const startDateUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
  );
  console.log(`TEST: StartDateUTC: ${CommonUtils.toJSONString(startDateUTC)}`);
  return startDateUTC;
};

const compareWithExpected = (world: CustomWorld, adjuster: (expected: Date) => void) => {
  const result = UtilActorMemory.getRememberedDate(world, LAST_PARSED_DATE);
  const expectedDate = getStartDateUTC();
  adjuster(expectedDate);
  console.log(
    `TOKEN ${token} : PARSED ${CommonUtils.toJSONString(result)} : EXPECTED ${CommonUtils.toJSONString(expectedDate)}`,
  );
  expect(result.toUTCString()).toBe(expectedDate.toUTCString());
};

Given<CustomWorld>("A date token {string}", function (this: CustomWorld, inputToken: string) {
  token = inputToken;
});

Given<CustomWorld>("An invalid date range string {string}", function (this: CustomWorld, inputToken: string) {
  token = inputToken;
  dateRangeTokenString = inputToken;
});

When<CustomWorld>("I parse the token", function (this: CustomWorld) {
  UtilActorMemory.rememberDate(this, LAST_PARSED_DATE, new Date(0));
  UtilActorMemory.clearError(this);
  try {
    const parsed = parser(this).parseDateToken(token);
    UtilActorMemory.rememberDate(this, LAST_PARSED_DATE, parsed);
  } catch (error) {
    UtilActorMemory.rememberError(this, error);
  }
});

Then<CustomWorld>(
  "an error should be thrown with message {string}",
  function (this: CustomWorld, expectedMessage: string) {
    const error = UtilActorMemory.getParseError(this);
    expect(error).toBeTruthy();
    expect(error?.message ?? "").toContain(expectedMessage);
  },
);

Then<CustomWorld>(
  "the result should be today's date minus two year and four month",
  function (this: CustomWorld) {
    compareWithExpected(this, (expected) => {
      expected.setUTCFullYear(expected.getUTCFullYear() - 2);
      expected.setUTCMonth(expected.getUTCMonth() - 4);
    });
  },
);

Then<CustomWorld>(
  "the result should be today's date minus one year and one month",
  function (this: CustomWorld) {
    compareWithExpected(this, (expected) => {
      expected.setUTCFullYear(expected.getUTCFullYear() - 1);
      expected.setUTCMonth(expected.getUTCMonth() - 1);
    });
  },
);

Then<CustomWorld>("the result should be today's date", function (this: CustomWorld) {
  compareWithExpected(this, () => undefined);
});

Then<CustomWorld>("the result should be tomorrow's date", function (this: CustomWorld) {
  compareWithExpected(this, (expected) => expected.setUTCDate(expected.getUTCDate() + 1));
});

Then<CustomWorld>("the result should be yesterday's date", function (this: CustomWorld) {
  compareWithExpected(this, (expected) => expected.setUTCDate(expected.getUTCDate() - 1));
});

Then<CustomWorld>("the result should be today's date minus two years", function (this: CustomWorld) {
  compareWithExpected(this, (expected) => expected.setUTCFullYear(expected.getUTCFullYear() - 2));
});

Then<CustomWorld>(
  "the result should be today's date minus one year, two months, and three days",
  function (this: CustomWorld) {
    compareWithExpected(this, (expected) => {
      expected.setUTCFullYear(expected.getUTCFullYear() - 1);
      expected.setUTCMonth(expected.getUTCMonth() - 2);
      expected.setUTCDate(expected.getUTCDate() - 3);
    });
  },
);

Then<CustomWorld>(
  "the result should be today's date plus one year, minus one month, and plus one day",
  function (this: CustomWorld) {
    compareWithExpected(this, (expected) => {
      expected.setUTCFullYear(expected.getUTCFullYear() + 1);
      expected.setUTCMonth(expected.getUTCMonth() - 1);
      expected.setUTCDate(expected.getUTCDate() + 1);
    });
  },
);

Then<CustomWorld>("the result should be today's date plus two years", function (this: CustomWorld) {
  compareWithExpected(this, (expected) => expected.setUTCFullYear(expected.getUTCFullYear() + 2));
});

Then<CustomWorld>("the result should be today's date plus five months", function (this: CustomWorld) {
  compareWithExpected(this, (expected) => expected.setUTCMonth(expected.getUTCMonth() + 5));
});

Then<CustomWorld>("the result should be tomorrow's date plus five months", function (this: CustomWorld) {
  compareWithExpected(this, (expected) => {
    expected.setUTCDate(expected.getUTCDate() + 1);
    expected.setUTCMonth(expected.getUTCMonth() + 5);
  });
});

Then<CustomWorld>(
  "the result should be yesterday's date plus five months and minus one year",
  function (this: CustomWorld) {
    compareWithExpected(this, (expected) => {
      expected.setUTCDate(expected.getUTCDate() - 1);
      expected.setUTCMonth(expected.getUTCMonth() + 5);
      expected.setUTCFullYear(expected.getUTCFullYear() - 1);
    });
  },
);

Then<CustomWorld>(
  "the result should equal today plus {int} years {int} months {int} days",
  function (this: CustomWorld, years: number, months: number, days: number) {
    compareWithExpected(this, (expected) => {
      expected.setUTCFullYear(expected.getUTCFullYear() + years);
      expected.setUTCMonth(expected.getUTCMonth() + months);
      expected.setUTCDate(expected.getUTCDate() + days);
    });
  },
);

Given<CustomWorld>("A null or invalid date token", function () {
  token = "INVALID";
});

Then<CustomWorld>("the result should be the Unix zero date", function (this: CustomWorld) {
  const result = UtilActorMemory.getRememberedDate(this, LAST_PARSED_DATE);
  const expectedDate = new Date(0);
  expectedDate.setUTCHours(0, 0, 0, 0);
  expect(result.toUTCString()).toBe(expectedDate.toUTCString());
});

Given<CustomWorld>("A date string {string}", function (this: CustomWorld, input: string) {
  dateStringToken = input;
});

When<CustomWorld>("I parse the date string token", function (this: CustomWorld) {
  UtilActorMemory.clearError(this);
  try {
    const parsed = parser(this).parseDateStringToken(dateStringToken);
    UtilActorMemory.rememberDate(this, SECONDARY_PARSED_DATE, parsed);
  } catch (error) {
    UtilActorMemory.rememberError(this, error);
  }
});

Then<CustomWorld>("the result should be {string}", function (this: CustomWorld, expectedDateStr: string) {
  const parsedDate = UtilActorMemory.getRememberedDate(this, SECONDARY_PARSED_DATE);
  const [year, month, day] = expectedDateStr.split("-").map(Number);
  const expectedDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  expect(parsedDate.toUTCString()).toBe(expectedDate.toUTCString());
});

Given<CustomWorld>("A date range string {string}", function (this: CustomWorld, input: string) {
  dateRangeTokenString = input;
});

When<CustomWorld>("I parse the date range string", function (this: CustomWorld) {
  UtilActorMemory.clearError(this);
  try {
    const range = parser(this).parseDateRangeToken(dateRangeTokenString);
    UtilActorMemory.rememberRange(this, range);
  } catch (error) {
    UtilActorMemory.rememberError(this, error);
  }
});

Then<CustomWorld>(
  "the start date should be {string} and the end date should be {string}",
  function (this: CustomWorld, startDate: string, endDate: string) {
    const range = UtilActorMemory.getRange(this);
    const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
    const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
    const expectedStart = new Date(Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0, 0));
    const expectedEnd = new Date(Date.UTC(endYear, endMonth - 1, endDay, 0, 0, 0, 0));

    expect(range.Start.toUTCString()).toBe(expectedStart.toUTCString());
    expect(range.End.toUTCString()).toBe(expectedEnd.toUTCString());
  },
);
