using AccessControl.Application.Common.Interfaces;
using AccessControl.Domain.Interfaces;
using AccessControl.Infrastructure.Persistence;
using AccessControl.Infrastructure.Persistence.Repositories;
using AccessControl.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AccessControl.Infrastructure;

public static class DependencyInjection
{
    /// <summary>
    /// Registra todos los servicios de la capa Infrastructure:
    /// DbContext, repositorios y UnitOfWork.
    /// </summary>
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        bool useInMemoryDatabase = false)
    {
        // --- AppDbContext ---
        if (useInMemoryDatabase)
        {
            // El nombre debe calcularse FUERA del lambda para que todos los scopes
            // compartan la misma base de datos InMemory durante el test.
            var inMemoryDbName = "TestDb_" + Guid.NewGuid();
            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase(inMemoryDbName));
        }
        else
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException(
                    "La cadena de conexión 'DefaultConnection' no está configurada.");

            services.AddDbContext<AppDbContext>(options =>
                options.UseMySql(
                    connectionString,
                    new MySqlServerVersion(new Version(8, 0, 0)),
                    mysql =>
                    {
                        mysql.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName);
                        mysql.EnableRetryOnFailure(
                            maxRetryCount: 5,
                            maxRetryDelay: TimeSpan.FromSeconds(10),
                            errorNumbersToAdd: null);
                    }));
        }

        // --- Repositorios específicos ---
        services.AddScoped<IVisitRepository, VisitRepository>();
        services.AddScoped<IPackageRepository, PackageRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRepresentativeRepository, RepresentativeRepository>();
        services.AddScoped<IDestinationRepository, DestinationRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IAuthorizationRepository, AuthorizationRepository>();
        services.AddScoped<IMenuRepository, MenuRepository>();

        // --- Unit of Work ---
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // --- Servicios de infraestructura ---
        services.AddScoped<IJwtTokenService, JwtTokenService>();

        return services;
    }
}
