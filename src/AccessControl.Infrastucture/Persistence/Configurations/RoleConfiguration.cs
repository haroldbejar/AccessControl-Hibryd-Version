using AccessControl.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccessControl.Infrastructure.Persistence.Configurations;

public sealed class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("Roles");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.Visible).HasDefaultValue(true);

        // Auditoría
        builder.Property(r => r.CreatedDate).IsRequired();
        builder.Property(r => r.Eliminated).HasDefaultValue(false);

        builder.HasIndex(r => r.Name).IsUnique();
    }
}
