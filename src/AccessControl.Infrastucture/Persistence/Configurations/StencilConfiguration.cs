using AccessControl.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccessControl.Infrastructure.Persistence.Configurations;

public sealed class StencilConfiguration : IEntityTypeConfiguration<Stencil>
{
    public void Configure(EntityTypeBuilder<Stencil> builder)
    {
        builder.ToTable("Stencils");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.Description).HasMaxLength(500);

        // Auditoría
        builder.Property(s => s.CreatedDate).IsRequired();
        builder.Property(s => s.Eliminated).HasDefaultValue(false);
    }
}
