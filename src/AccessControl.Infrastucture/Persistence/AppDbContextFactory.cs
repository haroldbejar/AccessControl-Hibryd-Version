using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AccessControl.Infrastructure.Persistence;

/// <summary>
/// Factory usada SOLO por las herramientas de diseño de EF Core (dotnet ef migrations).
/// Aísla la creación del DbContext del startup completo de la API.
/// </summary>
public sealed class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        // Connection string para desarrollo local (XAMPP, root sin password).
        // Esta factory es SOLO para herramientas de diseño, no se usa en runtime.
        var connectionString =
            Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? "Server=localhost;Port=3306;Database=AccessControlData;User=root;Password=;";

        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseMySql(
            connectionString,
            new MySqlServerVersion(new Version(8, 0, 0)));

        return new AppDbContext(optionsBuilder.Options);
    }
}
