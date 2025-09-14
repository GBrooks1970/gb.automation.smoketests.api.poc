using Microsoft.OpenApi.Models;
using System.Text.Json;
using TokenParserAPI.responses;
using TokenParserAPI.utils;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TokenParserAPI", Version = "v1" });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    // JSON endpoint
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "TokenParserAPI v1 (JSON)");

    // YAML endpoint
    c.SwaggerEndpoint("/swagger/v1/swagger.yaml", "TokenParserAPI v1 (YAML)");
});


// Endpoint 1: Route to health checker
app.MapGet("/alive", () =>
{
    try
    {
        return Results.Ok(new TokenParserApiAliveResponse { Status = "ALIVE-AND-KICKING" });
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new TokenParserApiErrorResponse { Error = ex.Message });
    }
});

// Endpoint 2: Route to parse date token
app.MapGet("/parse-date-token", (string tokenString) =>
{
    try
    {
        var parsedDate = TokenParser.ParseDateToken(tokenString);
        TokenParserApiResponse resp = new TokenParserApiResponse { ParsedToken = parsedDate };
        return Results.Ok(resp);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new TokenParserApiErrorResponse { Error = ex.Message });
    }
});

// Endpoint 3: Route to parse dynamic string token
app.MapGet("/parse-dynamic-string", (string tokenString) =>
{
    try
    {
        var ParsedToken = TokenParser.ParseDynamicStringToken(tokenString);
        TokenParserApiResponse resp = new TokenParserApiResponse { ParsedToken = ParsedToken };
        return Results.Ok(resp);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new TokenParserApiErrorResponse { Error = ex.Message });
    }
});

app.Run();
