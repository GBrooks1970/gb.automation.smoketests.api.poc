using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Microsoft.OpenApi.Writers;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;
using TokenParserAPI.responses;
using TokenParserAPI.utils;
using HttpJsonOptions = Microsoft.AspNetCore.Http.Json.JsonOptions;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Token Parser API",
        Version = "1.0.0",
        Description = "API to parse token date strings and dynamic string tokens"
    });
    options.AddServer(new OpenApiServer { Url = "/" });
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
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Token Parser API v1");
    c.RoutePrefix = "swagger/v1/json";
});

app.MapGet("/swagger/v1/json", () => Results.Redirect("/swagger/v1/json/index.html", permanent: false));
app.MapGet("/swagger/v1/swagger.yaml", (ISwaggerProvider swaggerProvider) =>
{
    var swaggerDoc = swaggerProvider.GetSwagger("v1");
    using var stringWriter = new StringWriter();
    var yamlWriter = new OpenApiYamlWriter(stringWriter);
    swaggerDoc.SerializeAsV3(yamlWriter);
    return Results.Content(stringWriter.ToString(), "application/x-yaml");
});


// Endpoint 1: Route to health checker
app.MapGet("/alive", () =>
{
    return Results.Ok(new TokenParserApiAliveResponse { Status = "ALIVE-AND-KICKING" });
})
.Produces<TokenParserApiAliveResponse>(StatusCodes.Status200OK, "application/json")
.WithName("Alive")
.WithOpenApi(operation =>
{
    operation.Summary = "Check if the API is alive";
    operation.Description = "Returns the status of the API.";

    if (operation.Responses.TryGetValue("200", out var okResponse))
    {
        okResponse.Description = "API is alive.";
        if (okResponse.Content.TryGetValue("application/json", out var content))
        {
            content.Example = new OpenApiObject
            {
                ["Status"] = new OpenApiString("ALIVE-AND-KICKING")
            };
        }
    }

    return operation;
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
})
.Produces<TokenParserApiResponse>(StatusCodes.Status200OK, "application/json")
.Produces<TokenParserApiErrorResponse>(StatusCodes.Status400BadRequest, "application/json")
.WithName("ParseDateToken")
.WithOpenApi(operation =>
{
    operation.Summary = "Parse a date token";
    operation.Description = "Parses the provided token into a formatted date string.";

    var tokenParameter = operation.Parameters.FirstOrDefault(p => p.In == ParameterLocation.Query && p.Name == "token");
    if (tokenParameter != null)
    {
        tokenParameter.Description = "The date token to be parsed";
        tokenParameter.Required = true;
    }

    if (operation.Responses.TryGetValue("200", out var okResponse))
    {
        okResponse.Description = "Successfully parsed the date token.";
        if (okResponse.Content.TryGetValue("application/json", out var content))
        {
            content.Example = new OpenApiObject
            {
                ["ParsedToken"] = new OpenApiString("2023-10-15 12:00:00Z")
            };
        }
    }

    if (operation.Responses.TryGetValue("400", out var badRequest))
    {
        badRequest.Description = "Invalid string token format.";
        if (badRequest.Content.TryGetValue("application/json", out var badContent))
        {
            badContent.Example = new OpenApiObject
            {
                ["Error"] = new OpenApiString("Invalid string token format")
            };
        }
    }

    return operation;
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
})
.Produces<TokenParserApiResponse>(StatusCodes.Status200OK, "application/json")
.Produces<TokenParserApiErrorResponse>(StatusCodes.Status400BadRequest, "application/json")
.WithName("ParseDynamicStringToken")
.WithOpenApi(operation =>
{
    operation.Summary = "Parse a dynamic string token";
    operation.Description = "Parses the provided token into a dynamic string.";

    var tokenParameter = operation.Parameters.FirstOrDefault(p => p.In == ParameterLocation.Query && p.Name == "token");
    if (tokenParameter != null)
    {
        tokenParameter.Description = "The token to be parsed";
        tokenParameter.Required = true;
    }

    if (operation.Responses.TryGetValue("200", out var okResponse))
    {
        okResponse.Description = "Successfully parsed the token.";
        if (okResponse.Content.TryGetValue("application/json", out var content))
        {
            content.Example = new OpenApiObject
            {
                ["ParsedToken"] = new OpenApiString("generatedstring")
            };
        }
    }

    if (operation.Responses.TryGetValue("400", out var badRequest))
    {
        badRequest.Description = "Invalid string token format.";
        if (badRequest.Content.TryGetValue("application/json", out var badContent))
        {
            badContent.Example = new OpenApiObject
            {
                ["Error"] = new OpenApiString("Invalid string token format")
            };
        }
    }

    return operation;
});

app.Run();
