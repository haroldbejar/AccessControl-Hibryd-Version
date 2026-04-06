using AccessControl.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccessControl.Infrastructure.Persistence.Configurations;

public sealed class MenuConfiguration : IEntityTypeConfiguration<Menu>
{
    public void Configure(EntityTypeBuilder<Menu> builder)
    {
        builder.ToTable("Menus");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Name)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(m => m.Page).HasMaxLength(100);
        builder.Property(m => m.Icon).HasMaxLength(50);

        // Auditoría
        builder.Property(m => m.CreatedDate).IsRequired();
        builder.Property(m => m.Eliminated).HasDefaultValue(false);

        builder.HasIndex(m => m.Name).IsUnique();
    }
}
