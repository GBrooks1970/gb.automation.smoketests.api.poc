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

        [When(@"a request with dynamic string token '(.*)' is made to the ParseDynamicStringToken endpoint")]
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


        [Then(@"the API response should return a status code of (.*) for the ParseDynamicStringToken endpoint")]
        public void ThenTheResponseShouldReturnAStatusCodeOfForDynamicToken(int statusCode)
        {
            requestHelper.ValidateStatusCode(_response, statusCode);
        }

        [Then(@"the response should contain ""(.*)"" with the value ""(.*)""")]
        public async Task ThenTheResponseShouldContainWithTheValue(string key, string expectedValue)
        {
            var jsonResponse = JsonDocument.Parse(_responseContent).RootElement;

            if (!jsonResponse.TryGetProperty(key, out var actualValue))
            {
                Assert.Fail($"Response does not contain '{key}'.");
            }

            var actualString = actualValue.GetString()?.Trim() ?? string.Empty;
            var actualLength = actualString.Length;

            switch (expectedValue)
            {
                case "An alpha-numeric string of length 5":
                    Assert.That(actualLength, Is.EqualTo(5), $"Expected generated string: {actualString} to be length 5");
                    Assert.That(actualString, Does.Match(@"^[A-Za-z0-9]+$"), $"Expected alpha-numeric string, got {actualString}");
                    break;

                case "A string of punctuation characters of length 3":
                    Assert.That(actualLength, Is.EqualTo(3), $"Expected generated string: {actualString} to be length 3");
                    Assert.That(actualString, Does.Match(@"^[\.\,\!\?\;\:]+$"), $"Expected punctuation characters .,!?;:, got {actualString}");
                    break;

                case "2 lines of strings with each line containing 10 alpha-numeric-punctuation characters":
                    const int lineCount = 2;
                    const int charsPerLine = 10;
                    var lines = actualString.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
                    Assert.That(lines.Length, Is.EqualTo(lineCount), $"Expected {lineCount} lines, got {lines.Length}");
                    foreach (var line in lines.Where(l => l.Length > 0))
                    {
                        Assert.That(line.Length, Is.EqualTo(charsPerLine), $"Line {line} length mismatch");
                        Assert.That(line, Does.Match(@"^[A-Za-z0-9\.\,\!\?\;\:]+$"), $"Line {line} must contain alpha-numeric-punctuation");
                    }
                    break;
                case "A numeric string of length 8":
                    Assert.That(actualLength, Is.EqualTo(8), $"Expected generated string: {actualString} to be length 8");
                    Assert.That(actualString, Does.Match(@"^\d+$"), $"Expected numeric characters only, got {actualString}");
                    break;
                case "3 lines of strings with each line containing 5 special characters":
                    const int expectedLines = 3;
                    const int expectedSpecialCharsPerLine = 5;
                    var specialLines = actualString.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
                    Assert.That(specialLines.Length, Is.EqualTo(expectedLines), $"Expected {expectedLines} lines, got {specialLines.Length}");
                    foreach (var line in specialLines.Where(l => l.Length > 0))
                    {
                        Assert.That(line.Length, Is.EqualTo(expectedSpecialCharsPerLine), $"Line {line} length mismatch");
                        Assert.That(line, Does.Match(@"^[!@#\$%\^&\*\(\)_\+\[\]\{\}\|;:,\.<>\?]+$"), $"Line {line} must contain special characters");
                    }
                    break;
                case "A mixed alpha, numeric, and special character string of length 12":
                    Assert.That(actualLength, Is.EqualTo(12), $"Expected generated string: {actualString} to be length 12");
                    Assert.That(actualString, Does.Match(@"^[A-Za-z0-9!@#\$%\^&\*\(\)_\+\[\]\{\}\|;:,\.<>\?]+$"), $"Expected alpha, numeric, and special characters, got {actualString}");
                    break;

                default:
                    Assert.That(actualValue.GetString(), Is.EqualTo(expectedValue));
                    break;
            }
        }
    }
}
