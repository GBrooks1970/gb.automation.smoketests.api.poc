namespace TokenParserAPI.responses
{
    public class TokenParserApiResponse : ITokenParserApiResponse
    {
        public required string ParsedToken { get; set; }
    }
}
