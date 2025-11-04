using Microsoft.Playwright;
using Newtonsoft.Json.Linq;
using System.Globalization;
using System.Reflection;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace TokenParserTests.Helpers
{
    public class RequestHelper_PW : IAsyncDisposable
    {
        private readonly string _baseAddress;
        private IPlaywright? _playwright;
        private IAPIRequestContext? _requestContext;

        public RequestHelper_PW(string baseAddress)
        {
            _baseAddress = baseAddress;
        }

        public async Task<IAPIRequestContext> GetRequestContext()
        {
            if (_requestContext != null)
            {
                return _requestContext;
            }

            _playwright = await Playwright.CreateAsync();
            _requestContext = await _playwright.APIRequest.NewContextAsync(new APIRequestNewContextOptions
            {
                BaseURL = _baseAddress
            });

            return _requestContext;
        }

        public async Task<IAPIResponse> GetAsyncToEndpoint(string endpoint, bool authenticated = false)
        {
            IAPIRequestContext requestContext = await GetRequestContext();

            var options = new APIRequestContextOptions
            {
                Headers = new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" }
                }
            };

            var response = await requestContext.GetAsync(endpoint, options);
            Console.WriteLine($"Response '{response}' ");

            return response;
        }

        // Sends a POST request with a token and returns the response
        public async Task<IAPIResponse> PostAsyncToEndpoint(
            string endpoint, 
            object requestBody
            )
        {
            IAPIRequestContext requestContext = await GetRequestContext();

            var options = new APIRequestContextOptions
            {
                Headers = new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" }
                },
                DataObject = requestBody // Use DataObject for JSON payload
            };

            var response = await requestContext.PostAsync(endpoint, options);
            Console.WriteLine($"Response '{response}' ");

            return response;
        }

        public async Task<JsonElement?> GetResponseString(IAPIResponse response)
        {
            var responseString = await response.JsonAsync();
            Console.WriteLine($"responseString '{responseString}' ");
            return responseString;
        }

        public JObject ParseJsonResponse(string responseString)
        {
            Console.WriteLine($"responseString '{responseString}' ");
            // Parse the JSON response
            return JObject.Parse(responseString);
        }

        // Validate status code
        public void ValidateStatusCode(IAPIResponse response, int expectedStatusCode)
        {
            Assert.That(expectedStatusCode, Is.EqualTo((int)response.Status));
        }

        public async Task ValidateResponseMessageContent(IAPIResponse response, string expectedMessage)
        {
            var jsonResponse = await GetResponseString(response);

            var actualMessage = jsonResponse.ToString();
            Console.WriteLine($"actualMessage '{actualMessage}' ");

            Assert.That(expectedMessage, Is.EqualTo(actualMessage), $"Expected string: {expectedMessage}, but got: {actualMessage}");
        }

        public static bool IsValidUTCDate(string dateStr)
        {
            // Regular expression to match ISO 8601 UTC format (e.g., "2023-10-08 14:30:00.00Z")
            string utcDateFormat = @"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}Z$";

            // Check if the input string matches the expected UTC date format
            if (!Regex.IsMatch(dateStr, utcDateFormat))
            {
                return false;
            }

            // Attempt to parse the date string into a DateTime object
            if (DateTime.TryParseExact(
                    dateStr,
                    "yyyy-MM-dd HH:mm:ssZ",
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal,
                    out DateTime parsedDate))
            {
                return true;
            }

            return false;
        }

        public static object GetPropertyValue<T>(T obj, string propertyName)
        {
            // Get the type of the object
            Type type = typeof(T);

            // Get the property by name
            PropertyInfo property = type.GetProperty(propertyName);

            if (property == null)
            {
                throw new ArgumentException($"Property '{propertyName}' not found on type '{type.FullName}'");
            }

            // Get the value of the property for the given object
            return property.GetValue(obj);
        }

        public async ValueTask DisposeAsync()
        {
            if (_requestContext != null)
            {
                await _requestContext.DisposeAsync();
                _requestContext = null;
            }

            if (_playwright != null)
            {
                _playwright.Dispose();
                _playwright = null;
            }
        }
    }
}
