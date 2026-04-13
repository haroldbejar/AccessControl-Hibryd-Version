using System.Text;
using AccessControl.API.Hubs;
using AccessControl.API.Middleware;
using AccessControl.API.Services;
using AccessControl.Application;
using AccessControl.Infrastructure;
using AccessControl.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;

try
{
    var builder = WebApplication.CreateBuilder(args);

    // ─── Serilog host ────────────────────────────────────────────────────────
    // Se usa configuración directa (sin CreateBootstrapLogger) para compatibilidad
    // con WebApplicationFactory en integration tests (evita ReloadableLogger.Freeze()).
    builder.Host.UseSerilog((ctx, lc) => lc
        .ReadFrom.Configuration(ctx.Configuration)
        .WriteTo.Console()
        .WriteTo.File("logs/accesscontrol-.log", rollingInterval: RollingInterval.Day));

    // ─── Application + Infrastructure ────────────────────────────────────────
    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration, builder.Environment.IsEnvironment("Testing"));

    // ─── Controllers ─────────────────────────────────────────────────────────
    builder.Services.AddControllers();

    // ─── SignalR + Photo Sessions ─────────────────────────────────────────────
    builder.Services.AddSignalR();
    builder.Services.AddSingleton<PhotoSessionService>();

    // ─── CORS ────────────────────────────────────────────────────────────────
    // SetIsOriginAllowed(_ => true) + AllowCredentials es requerido para SignalR:
    // SignalR usa credentials:'include' en negotiate, incompatible con AllowAnyOrigin().
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAll", policy =>
            policy.SetIsOriginAllowed(_ => true)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials());
    });

    // ─── Swagger / OpenAPI ───────────────────────────────────────────────────
    // Se omite en entorno Testing para evitar conflictos de versión entre
    // Microsoft.OpenApi v2.x (AspNetCore.OpenApi 9) y Swashbuckle v10.
    if (!builder.Environment.IsEnvironment("Testing"))
    {
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

            // Soporte JWT en Swagger
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Ingresa el token JWT. Ejemplo: Bearer {token}"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    new List<string>()
                }
            });
        });
    }

    // ─── JWT Authentication ────────────────────────────────────────────────────
    var jwtKey = builder.Configuration["Jwt:Key"]
        ?? throw new InvalidOperationException("La clave 'Jwt:Key' no está configurada.");
    var jwtIssuer = builder.Configuration["Jwt:Issuer"]
        ?? throw new InvalidOperationException("El valor 'Jwt:Issuer' no está configurado.");
    var jwtAudience = builder.Configuration["Jwt:Audience"]
        ?? throw new InvalidOperationException("El valor 'Jwt:Audience' no está configurado.");

    builder.Services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtKey)),
                ClockSkew = TimeSpan.Zero
            };
        });

    // ─── Health Checks ───────────────────────────────────────────────────────
    builder.Services.AddHealthChecks();

    var app = builder.Build();

    Log.Information("Iniciando AccessControl API...");

    // ─── Seed de datos iniciales ──────────────────────────────────────────────
    if (!app.Environment.IsEnvironment("Testing"))
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await dbContext.Database.MigrateAsync();
        await DbSeeder.SeedAsync(dbContext);
    }

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
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();
    app.MapHub<PhotoHub>("/hubs/photo");
    app.MapHealthChecks("/health");

    app.Run();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "AccessControl API terminó de forma inesperada.");
}
finally
{
    Log.CloseAndFlush();
}

