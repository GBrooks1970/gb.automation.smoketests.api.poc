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

        [When(@"a GET request is made to the DateTokenParser Endpoint")]
        public async Task WhenISendARequestWithTokenToTheParsedTokenAPI()
        {
            string endpoint = "/parse-date-token";
            var queryParams = new Dictionary<string, string>
            {
                { "tokenString", _Token }
            };
            string encodedUrl = UrlHelper.BuildEncodedUrl(endpoint, queryParams);

            _response = await requestHelper.GetAsyncToEndpoint(encodedUrl);

            _responseContent = await requestHelper.GetResponseString(_response);

        }
        [Then(@"the API response for the DateTokenParser Endpoint should return a status code of (.*)")]
        public void ThenTheAPIResponseForTheDateTokenParserEndpointShouldReturnAStatusCodeOf(int statusCode)
        {
            requestHelper.ValidateStatusCode(_response, statusCode);
        }

        [Then(@"the response body should contain ""(.*)"" with the value ""(.*)""")]
        public async Task ThenTheResponseBodyShouldContainWithTheValue(string key, string expectedValue)
        {
            // Parse the JSON response
            var jsonResponse01 = requestHelper.ParseJsonResponse(_responseContent);
            var jsonResponse = JsonDocument.Parse(_responseContent).RootElement;

            if (jsonResponse.TryGetProperty(key, out var actualValue))
            { // Handle relative date parsing logic for tokens like "[TODAY-1YEAR-1MONTH]"
                DateTime today = DateTime.Today;
                DateTime expectedDate = today;

                if (expectedValue.Contains("ago") || expectedValue.Contains("ahead") || expectedValue.Equals("today"))
                {
                   
                    //Adjust date according to expected outcome
                    if (expectedValue == "one year and one month ago from today")
                    {
                        expectedDate = today.AddYears(-1).AddMonths(-1);
                    }
                    else if (expectedValue == "one year ahead and two months ago from today")
                    {
                        expectedDate = today.AddYears(1).AddMonths(-2);
                    }

                    string formattedDate = expectedDate.ToString("yyyy-MM-dd HH:mm:ssZ", CultureInfo.InvariantCulture);

                    Assert.That(actualValue.GetString(), Is.EqualTo(formattedDate));
                }
                else
                {           
                    //Specific value expected
                    Assert.That(actualValue.GetString(), Is.EqualTo(expectedValue));
                }
            }
            else
            {                
                Assert.That(jsonResponse.TryGetProperty(key, out _), Is.True, $"Response does not contain '{key}'.");
            }
        }
    }
}