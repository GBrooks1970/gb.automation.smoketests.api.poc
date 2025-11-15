namespace TokenParserAPI.responses
{
    public class TokenParserApiErrorResponse : ITokenParserApiErrorResponse
    {
        public required string Error { get; set; }
    }
}
