using AccessControl.Domain.Common;
using AccessControl.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AccessControl.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // --- DbSets ---
    public DbSet<Visit> Visits => Set<Visit>();
    public DbSet<Package> Packages => Set<Package>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Destination> Destinations => Set<Destination>();
    public DbSet<Representative> Representatives => Set<Representative>();
    public DbSet<Mail> Mails => Set<Mail>();
    public DbSet<Stencil> Stencils => Set<Stencil>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Aplicar todas las configuraciones definidas en el mismo ensamblado
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Filtro global de soft delete para todas las entidades que hereden de BaseEntity
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .HasQueryFilter(BuildSoftDeleteFilter(entityType.ClrType));
            }
        }
    }

    // Construye la expresión lambda: e => !e.Eliminated
    private static System.Linq.Expressions.LambdaExpression BuildSoftDeleteFilter(Type type)
    {
        var param = System.Linq.Expressions.Expression.Parameter(type, "e");
        var body = System.Linq.Expressions.Expression.Not(
            System.Linq.Expressions.Expression.Property(param, nameof(BaseEntity.Eliminated)));
        return System.Linq.Expressions.Expression.Lambda(body, param);
    }

    // --- Auditoría automática ---
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedDate = now;
                    entry.Entity.ModifiedDate = now;
                    break;

                case EntityState.Modified:
                    entry.Entity.ModifiedDate = now;
                    break;

                case EntityState.Deleted:
                    // Convertir hard delete en soft delete
                    entry.State = EntityState.Modified;
                    entry.Entity.Eliminated = true;
                    entry.Entity.EliminatedDate = now;
                    break;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
