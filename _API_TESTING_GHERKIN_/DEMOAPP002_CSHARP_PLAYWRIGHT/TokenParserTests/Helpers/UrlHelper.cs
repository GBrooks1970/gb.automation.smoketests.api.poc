namespace TokenParserTests.Helpers
{
    public class UrlHelper
    {
        public static string BuildEncodedUrl(string baseUrl, Dictionary<string, string> queryParams)
        {
            // Build the base URI, using Uri.EscapeUriString to encode the path if needed
            string encodedUrl = Uri.EscapeUriString(baseUrl);

            // Build the query string with encoded parameters
            if (queryParams != null && queryParams.Count > 0)
            {
                List<string> queryStrings = new List<string>();

                foreach (var param in queryParams)
                {
                    string encodedKey = Uri.EscapeDataString(param.Key);
                    string encodedValue = Uri.EscapeDataString(param.Value);
                    queryStrings.Add($"{encodedKey}={encodedValue}");
                }

                encodedUrl += "?" + string.Join("&", queryStrings);
            }
            Console.WriteLine($"encodedUrl '{encodedUrl}' ");
            return encodedUrl;
        }
    }
}
