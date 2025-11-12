using TechTalk.SpecFlow;
using Newtonsoft.Json;
using TokenParserAPI.responses;
using NUnit.Framework.Legacy;
using TokenParserTests.Helpers;
using NUnit.Framework.Internal;
using System.Globalization;
using System.Text.Json;

namespace TokenParserTests.Steps
{
    [Binding]
    public class DateTokenParser_Steps
    {
        private RequestHelper requestHelper;
        private string _responseContent;
        public DateTokenParser_Steps() => requestHelper = new RequestHelper("http://localhost:5228");
        public string _Token;

        private HttpResponseMessage _response;

        [Given(@"a valid or invalid date token ""(.*)""")]
        public void GivenAValidOrInvalidDateToken(string token)
        {
            _Token = token;
        }

        [When(@"a GET request is made to the ParseDateToken Endpoint")]
        public async Task WhenISendARequestWithTokenToTheParsedTokenAPI()
        {
            string endpoint = "/parse-date-token";
            var queryParams = new Dictionary<string, string>
            {
                { "token", _Token }
            };
            string encodedUrl = UrlHelper.BuildEncodedUrl(endpoint, queryParams);

            _response = await requestHelper.GetAsyncToEndpoint(encodedUrl);

            _responseContent = await requestHelper.GetResponseString(_response);

        }
        [Then(@"the API response for the ParseDateToken Endpoint should return a status code of (.*)")]
        public void ThenTheAPIResponseForTheDateTokenParserEndpointShouldReturnAStatusCodeOf(int statusCode)
        {
            requestHelper.ValidateStatusCode(_response, statusCode);
        }

        [Then(@"the response body should contain ""(.*)"" with the value ""(.*)""")]
        public async Task ThenTheResponseBodyShouldContainWithTheValue(string key, string expectedValue)
        {
            var jsonResponse = JsonDocument.Parse(_responseContent).RootElement;

            if (!jsonResponse.TryGetProperty(key, out var actualValue))
            {
                Assert.That(jsonResponse.TryGetProperty(key, out _), Is.True, $"Response does not contain '{key}'.");
                return;
            }

            var actualString = actualValue.GetString();
            switch (expectedValue)
            {
                case "today":
                    AssertRelativeDate(actualString, 0, 0);
                    break;
                case "one year and one month ago from today":
                    AssertRelativeDate(actualString, -1, -1);
                    break;
                case "one year ahead and two months ago from today":
                    AssertRelativeDate(actualString, 1, -2);
                    break;
                case "tomorrow plus three days (four days from today)":
                    AssertRelativeDate(actualString, 0, 0, 4);
                    break;
                case "yesterday minus two days (three days ago)":
                    AssertRelativeDate(actualString, 0, 0, -3);
                    break;
                case "two years and six months ahead of today minus 15 days":
                    AssertRelativeDate(actualString, 2, 6, -15);
                    break;
                default:
                    Assert.That(actualString, Is.EqualTo(expectedValue));
                    break;
            }
        }

        private static void AssertRelativeDate(string? actualValue, int yearsOffset, int monthsOffset, int daysOffset = 0)
        {
            DateTime expectedDate = DateTime.Today.AddYears(yearsOffset).AddMonths(monthsOffset).AddDays(daysOffset);
            string formattedDate = expectedDate.ToString("yyyy-MM-dd HH:mm:ssZ", CultureInfo.InvariantCulture);
            Assert.That(actualValue, Is.EqualTo(formattedDate));
        }

        [Then(@"the result should equal today plus (.*) years (.*) months (.*) days")]
        public void ThenTheResultShouldEqualTodayPlusYearsMonthsDays(int years, int months, int days)
        {
            var jsonResponse = JsonDocument.Parse(_responseContent).RootElement;
            if (!jsonResponse.TryGetProperty("ParsedToken", out var parsedToken))
            {
                Assert.Fail("Response does not contain 'ParsedToken'.");
            }

            var expectedDate = DateTime.Today.AddYears(years).AddMonths(months).AddDays(days);
            var formattedDate = expectedDate.ToString("yyyy-MM-dd HH:mm:ssZ", CultureInfo.InvariantCulture);

            Assert.That(parsedToken.GetString(), Is.EqualTo(formattedDate));
        }
    }
}
