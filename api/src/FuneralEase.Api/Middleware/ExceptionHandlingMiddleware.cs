using System.Text.Json;
using FuneralEase.Application.Common.Exceptions;

namespace FuneralEase.Api.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title, errors) = exception switch
        {
            ValidationException ve => (422, "Validation Error", ve.Errors),
            NotFoundException => (404, "Not Found", null),
            ForbiddenException => (403, "Forbidden", null),
            InvalidOperationException => (400, "Bad Request", null),
            _ => (500, "Internal Server Error", null)
        };

        if (statusCode == 500)
            logger.LogError(exception, "Unhandled exception");

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var response = new
        {
            type = $"https://httpstatuses.io/{statusCode}",
            title,
            status = statusCode,
            detail = statusCode == 500 ? "An unexpected error occurred." : exception.Message,
            errors
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    }
}
