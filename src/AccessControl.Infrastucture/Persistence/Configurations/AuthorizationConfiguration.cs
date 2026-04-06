using AccessControl.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccessControl.Infrastructure.Persistence.Configurations;

public sealed class AuthorizationConfiguration : IEntityTypeConfiguration<Authorization>
{
    public void Configure(EntityTypeBuilder<Authorization> builder)
    {
        builder.ToTable("Authorizations");

        builder.HasKey(a => a.Id);

        // CRUD permissions
        builder.Property(a => a.Create).HasDefaultValue(false);
        builder.Property(a => a.Read).HasDefaultValue(false);
        builder.Property(a => a.Update).HasDefaultValue(false);
        builder.Property(a => a.Delete).HasDefaultValue(false);

        // Auditoría
        builder.Property(a => a.CreatedDate).IsRequired();
        builder.Property(a => a.Eliminated).HasDefaultValue(false);

        // Índice compuesto — un rol no puede tener dos registros para el mismo menú
        builder.HasIndex(a => new { a.RoleId, a.MenuId }).IsUnique();

        // Relaciones
        builder.HasOne(a => a.Role)
            .WithMany(r => r.Authorizations)
            .HasForeignKey(a => a.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.Menu)
            .WithMany(m => m.Authorizations)
            .HasForeignKey(a => a.MenuId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
