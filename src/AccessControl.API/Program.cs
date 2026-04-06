using AccessControl.API.Middleware;
using AccessControl.Application;
using AccessControl.Infrastructure;
using Microsoft.OpenApi;
using Serilog;

// ─── Serilog ────────────────────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/accesscontrol-.log", rollingInterval: RollingInterval.Day)
    .CreateBootstrapLogger();

try
{
    Log.Information("Iniciando AccessControl API...");

    var builder = WebApplication.CreateBuilder(args);

    // ─── Serilog host ────────────────────────────────────────────────────────
    builder.Host.UseSerilog((ctx, lc) => lc
        .ReadFrom.Configuration(ctx.Configuration)
        .WriteTo.Console()
        .WriteTo.File("logs/accesscontrol-.log", rollingInterval: RollingInterval.Day));

    // ─── Application + Infrastructure ────────────────────────────────────────
    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration);

    // ─── Controllers ─────────────────────────────────────────────────────────
    builder.Services.AddControllers();

    // ─── CORS ────────────────────────────────────────────────────────────────
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAll", policy =>
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader());
    });

    // ─── Swagger / OpenAPI ───────────────────────────────────────────────────
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "AccessControl API",
            Version = "v1",
            Description = "API REST para el sistema de control de acceso de conjuntos residenciales",
            Contact = new OpenApiContact { Name = "AccessControl Team" }
        });

        // Soporte JWT en Swagger (preparado para Subfase 1.6)
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Ingresa el token JWT. Ejemplo: Bearer {token}"
        });

        c.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecuritySchemeReference("Bearer"),
                new List<string>()
            }
        });
    });

    // ─── Health Checks ───────────────────────────────────────────────────────
    builder.Services.AddHealthChecks();

    var app = builder.Build();

    // ─── Middleware pipeline ──────────────────────────────────────────────────
    app.UseMiddleware<ExceptionMiddleware>();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "AccessControl API v1");
            c.RoutePrefix = string.Empty; // Swagger en raíz: http://localhost:5000/
        });
    }

    app.UseSerilogRequestLogging();
    app.UseHttpsRedirection();
    app.UseCors("AllowAll");
    app.UseAuthorization();
    app.MapControllers();
    app.MapHealthChecks("/health");

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "AccessControl API terminó de forma inesperada.");
}
finally
{
    Log.CloseAndFlush();
}

