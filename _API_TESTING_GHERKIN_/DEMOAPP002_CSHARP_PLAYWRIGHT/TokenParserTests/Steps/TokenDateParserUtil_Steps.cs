using NUnit.Framework;
using System;
using TechTalk.SpecFlow;
using TokenParserAPI.utils;

namespace TokenParserTests.Steps
{
    [Binding]
    public class TokenDateParserUtil_Steps
    {
        private readonly ParsedTokenParser _parser = new();
        private string _token = string.Empty;
        private DateTime? _result;
        private Exception? _exception;

        [Given(@"A date token ""(.*)""")]
        public void GivenADateToken(string token)
        {
            _token = token;
        }

        [Given(@"An invalid date range string ""(.*)""")]
        public void GivenAnInvalidDateRangeString(string token)
        {
            _token = token;
        }

        [When(@"I parse the token")]
        public void WhenIParseTheToken()
        {
            _exception = null;
            _result = null;

            try
            {
                _result = _parser.ParseToken(_token);
            }
            catch (Exception ex)
            {
                _exception = ex;
            }
        }

        [Then(@"the result should be today's date")]
        public void ThenTheResultShouldBeTodaySDate()
        {
            AssertRelativeDate(() => DateTime.Today);
        }

        [Then(@"the result should be tomorrow's date")]
        public void ThenTheResultShouldBeTomorrowSDate()
        {
            AssertRelativeDate(() => DateTime.Today.AddDays(1));
        }

        [Then(@"the result should be yesterday's date")]
        public void ThenTheResultShouldBeYesterdaySDate()
        {
            AssertRelativeDate(() => DateTime.Today.AddDays(-1));
        }

        [Then(@"the result should be today's date minus two year and four month")]
        public void ThenTheResultShouldBeTodayMinusTwoYearsAndFourMonths()
        {
            AssertRelativeDate(() => DateTime.Today.AddYears(-2).AddMonths(-4));
        }

        [Then(@"the result should be today's date minus one year and one month")]
        public void ThenTheResultShouldBeTodayMinusOneYearAndOneMonth()
        {
            AssertRelativeDate(() => DateTime.Today.AddYears(-1).AddMonths(-1));
        }

        [Then(@"the result should be today's date minus one year, two months, and three days")]
        public void ThenTheResultShouldBeTodayMinusOneYearTwoMonthsAndThreeDays()
        {
            AssertRelativeDate(() => DateTime.Today.AddYears(-1).AddMonths(-2).AddDays(-3));
        }

        [Then(@"the result should be today's date plus one year, minus one month, and plus one day")]
        public void ThenTheResultShouldBeTodayPlusOneYearMinusOneMonthPlusOneDay()
        {
            AssertRelativeDate(() => DateTime.Today.AddYears(1).AddMonths(-1).AddDays(1));
        }

        [Then(@"the result should be today's date plus two years")]
        public void ThenTheResultShouldBeTodayPlusTwoYears()
        {
            AssertRelativeDate(() => DateTime.Today.AddYears(2));
        }

        [Then(@"the result should be today's date plus five months")]
        public void ThenTheResultShouldBeTodayPlusFiveMonths()
        {
            AssertRelativeDate(() => DateTime.Today.AddMonths(5));
        }

        [Then(@"the result should be tomorrow's date plus five months")]
        public void ThenTheResultShouldBeTomorrowPlusFiveMonths()
        {
            AssertRelativeDate(() => DateTime.Today.AddDays(1).AddMonths(5));
        }

        [Then(@"the result should be yesterday's date plus five months and minus one year")]
        public void ThenTheResultShouldBeYesterdayPlusFiveMonthsMinusOneYear()
        {
            AssertRelativeDate(() => DateTime.Today.AddDays(-1).AddMonths(5).AddYears(-1));
        }

        [Then(@"an error should be thrown with message ""(.*)""")]
        public void ThenAnErrorShouldBeThrownWithMessage(string expectedMessage)
        {
            Assert.That(_exception, Is.Not.Null, "Expected parsing to throw an exception.");
            Assert.That(_exception!.Message, Does.Contain(expectedMessage));
        }

        private void AssertRelativeDate(Func<DateTime> expectedFactory)
        {
            Assert.That(_exception, Is.Null, () => $"Unexpected exception: {_exception}");
            Assert.That(_result, Is.Not.Null, "Parsing did not produce a result.");

            var expected = expectedFactory().Date;
            Assert.That(_result!.Value.Date, Is.EqualTo(expected));
        }
    }
}
