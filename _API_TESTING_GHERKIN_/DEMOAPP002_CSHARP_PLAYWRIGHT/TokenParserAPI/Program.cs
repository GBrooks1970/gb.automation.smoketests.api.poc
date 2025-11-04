using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using TokenParserAPI.responses;
using TokenParserAPI.utils;
using HttpJsonOptions = Microsoft.AspNetCore.Http.Json.JsonOptions;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TokenParserAPI", Version = "v1" });
});

builder.Services.Configure<HttpJsonOptions>(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = null;
    options.SerializerOptions.DictionaryKeyPolicy = null;
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
app.MapGet("/parse-date-token", (
    [FromQuery(Name = "token")] string? token) =>
{
    if (string.IsNullOrWhiteSpace(token))
    {
        return Results.BadRequest(new TokenParserApiErrorResponse { Error = "Token date is required" });
    }

    try
    {
        var parsedDate = TokenParser.ParseDateToken(token);
        var response = new TokenParserApiResponse { ParsedToken = parsedDate };
        return Results.Ok(response);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new TokenParserApiErrorResponse { Error = ex.Message });
    }
});

// Endpoint 3: Route to parse dynamic string token
app.MapGet("/parse-dynamic-string-token", (
    [FromQuery(Name = "token")] string? token) =>
{
    if (string.IsNullOrWhiteSpace(token))
    {
        return Results.BadRequest(new TokenParserApiErrorResponse { Error = "Token string is required" });
    }

    try
    {
        var parsedToken = TokenParser.ParseDynamicStringToken(token);
        var response = new TokenParserApiResponse { ParsedToken = parsedToken };
        return Results.Ok(response);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new TokenParserApiErrorResponse { Error = ex.Message });
    }
});

app.Run();
