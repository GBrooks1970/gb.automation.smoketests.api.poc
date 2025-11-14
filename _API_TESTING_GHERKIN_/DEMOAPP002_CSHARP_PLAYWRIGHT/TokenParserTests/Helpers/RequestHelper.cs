using System.Text.Json;
using System.Net.Mime;
using System.Text;
using System.Net.Http.Headers;
using Newtonsoft.Json.Linq;
using System.Globalization;
using System.Text.RegularExpressions;
using System.Reflection;
using TokenParserAPI.utils;

namespace TokenParserTests.Helpers
{
    public class RequestHelper(string baseAddress)
    {
        private HttpClient _client;
        private string _responseContent;


        public HttpClient CreateClient(string baseAddress) => _client = new HttpClient { BaseAddress = new Uri(baseAddress) };

        public async Task<HttpResponseMessage> GetAsyncToEndpoint(string uri, bool authenticated = false)
        {
            var client = CreateClient(baseAddress);
            if (authenticated)
            {
                AddAuthorizationHeader(client);
            }

            return await client.GetAsync(uri);
        }

        public async Task<HttpResponseMessage> PostAsyncToEndpoint(
            string uri,
            object payload,
            bool authenticated = false
            )
        {
            var client = CreateClient(baseAddress);
            if (authenticated)
            {
                AddAuthorizationHeader(client);
            }

            var body = JsonSerializer.Serialize(payload);
            var content = new StringContent(body, Encoding.UTF8, MediaTypeNames.Application.Json);
            return await client.PostAsync(uri, content);
        }

        public async Task<string> GetResponseString(HttpResponseMessage response)
        {
            string responseString = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"responseString '{responseString}' ");
            return responseString;
        }
        public JObject ParseJsonResponse(string responseString)
        {
            Console.WriteLine($"responseString '{responseString}' ");
            // Parse the JSON response
            return JObject.Parse(responseString);
        }

        public string GetToken(/*User user*/)
        {
            // Get user token
            var token = "";
            return token;
        }

        private void AddAuthorizationHeader(HttpClient _httpClient)
        {
            var apiToken = GetToken();
            //_httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiToken);
        }

        // Validate status code
        public void ValidateStatusCode(HttpResponseMessage response, int expectedStatusCode)
        {
            Assert.That(expectedStatusCode, Is.EqualTo((int)response.StatusCode));
        }

        public async Task ValidateResponseMessageContent(HttpResponseMessage response, string expectedMessage)
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
                    DateFormatting.CanonicalFormat,
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

    }

}
