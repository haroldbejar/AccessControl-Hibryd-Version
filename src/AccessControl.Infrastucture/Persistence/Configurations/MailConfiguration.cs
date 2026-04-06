using AccessControl.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccessControl.Infrastructure.Persistence.Configurations;

public sealed class MailConfiguration : IEntityTypeConfiguration<Mail>
{
    public void Configure(EntityTypeBuilder<Mail> builder)
    {
        builder.ToTable("Mails");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.Email).HasMaxLength(100);

        // Auditoría
        builder.Property(m => m.CreatedDate).IsRequired();
        builder.Property(m => m.Eliminated).HasDefaultValue(false);
    }
}
