using AccessControl.Domain.Entities;
using AccessControl.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace AccessControl.API.IntegrationTests.Infrastructure;

public class AccessControlWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Establece el entorno "Testing" para que DependencyInjection.cs use InMemory
        builder.UseEnvironment("Testing");
    }

    public Task InitializeAsync()
    {
        // Services accede al host (lo crea si no existe) DESPUÉS de que toda la DI
        // está construida y el logger de Serilog ya está congelado → sin conflictos.
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.EnsureCreated();
        SeedDatabase(db);
        return Task.CompletedTask;
    }

    public new Task DisposeAsync() => Task.CompletedTask;

    private static void SeedDatabase(AppDbContext db)
    {
        var role = new Role { Name = "Admin", Visible = true };
        db.Set<Role>().Add(role);
        db.SaveChanges();

        var user = new User
        {
            UserAccount = "admin_test",
            Password = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Name = "Administrador Test",
            RoleId = role.Id,
            Visible = true
        };
        db.Set<User>().Add(user);
        db.SaveChanges();
    }
}
