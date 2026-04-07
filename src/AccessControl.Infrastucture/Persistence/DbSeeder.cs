using AccessControl.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AccessControl.Infrastructure.Persistence;

public static class DbSeeder
{
    /// <summary>
    /// Inserta datos iniciales si la base de datos está vacía.
    /// Idempotente: verifica existencia antes de insertar.
    /// </summary>
    public static async Task SeedAsync(AppDbContext context)
    {
        // --- Rol Admin ---
        var adminRole = await context.Roles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.Name == "Admin");

        if (adminRole is null)
        {
            adminRole = new Role
            {
                Name = "Admin",
                Visible = true,
                CreatedDate = DateTime.UtcNow,
                UserCreated = 1
            };
            context.Roles.Add(adminRole);
            await context.SaveChangesAsync();
        }

        // --- Usuario admin ---
        var adminUser = await context.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.UserAccount == "admin");

        if (adminUser is null)
        {
            adminUser = new User
            {
                UserAccount = "admin",
                Password = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Name = "Administrador",
                RoleId = adminRole.Id,
                Visible = true,
                CreatedDate = DateTime.UtcNow,
                UserCreated = 1
            };
            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
        }
    }
}
