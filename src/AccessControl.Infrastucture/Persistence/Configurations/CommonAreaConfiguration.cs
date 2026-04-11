using AccessControl.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccessControl.Infrastructure.Persistence.Configurations;

public sealed class CommonAreaConfiguration : IEntityTypeConfiguration<CommonArea>
{
    public void Configure(EntityTypeBuilder<CommonArea> builder)
    {
        builder.ToTable("CommonAreas");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(c => c.Name)
            .IsUnique();

        builder.Property(c => c.Description)
            .HasMaxLength(500);

        builder.Property(c => c.Location)
            .HasMaxLength(200);

        builder.Property(c => c.OpeningTime)
            .HasColumnType("time");

        builder.Property(c => c.ClosingTime)
            .HasColumnType("time");

        // Propiedad calculada — ignorada en BD
        builder.Ignore(c => c.IsAvailable);

        // Auditoría
        builder.Property(c => c.CreatedDate).IsRequired();
        builder.Property(c => c.Eliminated).HasDefaultValue(false);
    }
}
