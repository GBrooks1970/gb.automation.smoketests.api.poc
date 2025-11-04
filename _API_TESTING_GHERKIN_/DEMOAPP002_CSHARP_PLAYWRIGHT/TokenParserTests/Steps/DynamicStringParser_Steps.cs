using TechTalk.SpecFlow;
using Newtonsoft.Json;
using TokenParserAPI.responses;
using NUnit.Framework.Legacy;
using TokenParserTests.Helpers;
using System.Text.Json;

namespace TokenParserTests.Steps
{
    [Binding]
    public class DynamicStringParser_Steps
    {
        private RequestHelper requestHelper;
        private string _responseContent;
        public DynamicStringParser_Steps() => requestHelper = new RequestHelper("http://localhost:5228");

        private HttpResponseMessage _response;


        [Given(@"the TokenParser API is available")]
        public void GivenTheDynamicStringAPIIsRunning()
        {
            //Assert.That(_requestContext, Is.Not.Null, "API context is not initialized");
        }

        [When(@"a request with dynamic string token '(.*)' is made to the DynamicStringParser endpoint")]
        public async Task WhenARequestWithDynamicStringTokenIsMadeToTheDynamicStringParserEndpoint(string token)
        {
            var endpoint = "/parse-dynamic-string-token";

            var queryParams = new Dictionary<string, string>
            {
                { "token", token }
            };
            string encodedUrl = UrlHelper.BuildEncodedUrl(endpoint, queryParams);

            _response = await requestHelper.GetAsyncToEndpoint(encodedUrl);

            _responseContent = await requestHelper.GetResponseString(_response);
        }


        [Then(@"the API response should return a status code of (.*) for the DynamicStringParser endpoint")]
        public void ThenTheResponseShouldReturnAStatusCodeOfForDynamicToken(int statusCode)
        {
            requestHelper.ValidateStatusCode(_response, statusCode);
        }

        [Then(@"the response should contain ""(.*)"" with the value ""(.*)""")]
        public async Task ThenTheResponseShouldContainWithTheValue(string key, string expectedValue)
        {
            // Parse the JSON response
            var jsonResponse01 = requestHelper.ParseJsonResponse(_responseContent);
            var jsonResponse = JsonDocument.Parse(_responseContent).RootElement;

            if (jsonResponse.TryGetProperty(key, out var actualValue))
            {
                var actualString = actualValue.GetString()?.Trim();
                var actulLength = actualString?.Length;

                // Handle dynamic verification for the different expected values
                if (expectedValue == "An alpha-numeric string of length 5")
                {
                    int expectedLength = 5;
                    Assert.That(expectedLength, Is.EqualTo(actulLength), $"Expected generated string: {actualString} to be of length: {expectedLength}, but got: {actulLength}");
                    Assert.That(actualString?.Trim(), Does.Match(@"^[A-Za-z0-9]+$"), $"Expected generated string: {actualString} to be a combination of alpha and numeric characters, but it is not");

                }
                else if (expectedValue == "A string of punctuation characters of length 3")
                {
                    int expectedLength = 3;
                    Assert.That(expectedLength, Is.EqualTo(actulLength), $"Expected generated string: {actualString} to be of length: {expectedLength}, but got: {actulLength}");
                    Assert.That(actualString?.Trim(), Does.Match(@"^[!@#$%^&*()]+$"), $"Expected generated string: {actualString} to be a punctuation characters, but it is not");
                }
                else if (expectedValue == "2 lines of strings with each line containing 10 alpha-numeric-punctuation characters")
                {

                    int lineCount = 2;
                    int charPerLine = 10;
                    var lines = actualString?.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
                    var actullineCount = lines?.Length; // Last line might be empty due to line break
                    Assert.That(lineCount, Is.EqualTo(actullineCount), $"Expected generated string: {actualString} to be of lineCount: {lineCount}, but got: {actullineCount}");

                    foreach (var line in lines)
                    {
                        if (line.Length > 0)
                        {
                            Assert.That(charPerLine, Is.EqualTo(line.Length), $"Expected generated string line: {line} to be of length: {charPerLine}, but got: {line.Length}");
                            Assert.That(line.Trim(), Does.Match(@"^[A-Za-z0-9!@#$%^&*()]+$"), $"Expected generated string line: {line} to be a combination of alpha, numeric, and punctuation characters, but it is not");
                        }
                    }
                }
                else
                {
                    Assert.That(actualValue.GetString(), Is.EqualTo(expectedValue));
                }
            }
            else
            {
                Assert.Fail($"Response does not contain '{key}'.");
            }
        }
    }
}
