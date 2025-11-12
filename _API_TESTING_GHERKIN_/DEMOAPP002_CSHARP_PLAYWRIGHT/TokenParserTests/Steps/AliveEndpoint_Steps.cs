using TechTalk.SpecFlow;
using Microsoft.Playwright;
using TokenParserTests.Helpers;
using Newtonsoft.Json;
using NUnit.Framework.Legacy;
using TokenParserAPI.responses;
using Newtonsoft.Json.Linq;
using NUnit.Framework.Internal;
using System;
using System.Threading.Tasks;
namespace TokenParserTests.Steps
{
    [Binding]
    public class AliveEndpoint_Steps
    {
        private IAPIResponse _response;
        private readonly RequestHelper_PW requestHelper;
        private string _responseContent;
        public AliveEndpoint_Steps() => requestHelper = new RequestHelper_PW("http://localhost:5228");

        [Given(@"the API is available")]
        public void GiventheAPIIsAvailable()
        {
            //Empty step for test case readabilty
            Console.WriteLine("Given the API is available");
        }

        [When(@"a GET request is made to the Alive Endpoint")]
        public async Task WhenISendAGETRequestTo()
        {
            var endpoint = "/alive";
            _response = await requestHelper.GetAsyncToEndpoint(endpoint);
        }

        [Then(@"the API response should return a status code of (.*)")]
        public void ThenTheResponseShouldReturnAStatusCodeOf(int statusCode)
        {
            requestHelper.ValidateStatusCode(_response, statusCode);
        }

        [Then(@"the Alive Endpoint response body should contain ""(.*)"" with the value ""(.*)""")]
        public async Task ThenTheResponseShouldContainTheMessage(string propertyName, string expectedString)
        {
            var jsonResponseString = await requestHelper.GetResponseString(_response);

            // Manually deserialize using Newtonsoft.Json
            var responseBody = JsonConvert.DeserializeObject<TokenParserApiAliveResponse>(jsonResponseString.ToString());

            var actualString = RequestHelper_PW.GetPropertyValue(responseBody, propertyName).ToString();
            Assert.That(expectedString, Is.EqualTo(actualString), $"Expected string: {expectedString}, but got: {actualString}");
        }

        [AfterScenario]
        public async Task DisposeContext()
        {
            await requestHelper.DisposeAsync();
        }
    }
}
