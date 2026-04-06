using System.Net;
using System.Text.Json;
using AccessControl.Domain.Exceptions;
using FluentValidation;

namespace AccessControl.API.Middleware;

public sealed class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation failed for {Path}: {Errors}",
                context.Request.Path,
                string.Join(", ", ex.Errors.Select(e => e.ErrorMessage)));

            await WriteResponseAsync(context, HttpStatusCode.BadRequest, new
            {
                type = "ValidationError",
                title = "Errores de validación",
                status = (int)HttpStatusCode.BadRequest,
                errors = ex.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.ErrorMessage).ToArray())
            });
        }
        catch (EntityNotFoundException ex)
        {
            _logger.LogWarning("Entity not found: {Message}", ex.Message);

            await WriteResponseAsync(context, HttpStatusCode.NotFound, new
            {
                type = "NotFound",
                title = "Recurso no encontrado",
                status = (int)HttpStatusCode.NotFound,
                detail = ex.Message
            });
        }
        catch (DomainException ex)
        {
            _logger.LogWarning("Domain exception: {Message}", ex.Message);

            await WriteResponseAsync(context, HttpStatusCode.UnprocessableEntity, new
            {
                type = "DomainError",
                title = "Error de negocio",
                status = (int)HttpStatusCode.UnprocessableEntity,
                detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception for {Method} {Path}",
                context.Request.Method, context.Request.Path);

            await WriteResponseAsync(context, HttpStatusCode.InternalServerError, new
            {
                type = "InternalServerError",
                title = "Error interno del servidor",
                status = (int)HttpStatusCode.InternalServerError,
                detail = "Ocurrió un error inesperado. Por favor contacte al administrador."
            });
        }
    }

    private static async Task WriteResponseAsync(HttpContext context, HttpStatusCode statusCode, object body)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        await context.Response.WriteAsync(JsonSerializer.Serialize(body, _jsonOptions));
    }
}
