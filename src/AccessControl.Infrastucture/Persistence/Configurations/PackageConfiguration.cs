using AccessControl.Domain.Entities;
using AccessControl.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccessControl.Infrastructure.Persistence.Configurations;

public sealed class PackageConfiguration : IEntityTypeConfiguration<Package>
{
    public void Configure(EntityTypeBuilder<Package> builder)
    {
        builder.ToTable("Packages");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.ControlNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(p => p.SenderName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.SenderCompany).HasMaxLength(100);
        builder.Property(p => p.TrackingNumber).HasMaxLength(50);
        builder.Property(p => p.Description).HasMaxLength(500);

        // Recepción
        builder.Property(p => p.ReceivedBy)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Photo).HasColumnType("longblob");
        builder.Property(p => p.ReceiverSignature).HasColumnType("longblob");

        // Entrega
        builder.Property(p => p.DeliveredTo).HasMaxLength(100);
        builder.Property(p => p.DeliveredToDocument).HasMaxLength(20);
        builder.Property(p => p.DeliverySignature).HasColumnType("longblob");

        // Estado (enum → int)
        builder.Property(p => p.Status)
            .HasConversion<int>()
            .HasDefaultValue(PackagesStatusEnum.Received);

        builder.Property(p => p.Notes).HasMaxLength(500);

        // Propiedades calculadas — ignoradas en BD
        builder.Ignore(p => p.StatusDescription);
        builder.Ignore(p => p.IsPending);

        // Auditoría
        builder.Property(p => p.CreatedDate).IsRequired();
        builder.Property(p => p.Eliminated).HasDefaultValue(false);

        // Índices
        builder.HasIndex(p => p.ControlNumber).IsUnique();
        builder.HasIndex(p => p.Status);
        builder.HasIndex(p => new { p.Eliminated, p.Status });

        // Relaciones
        builder.HasOne(p => p.Destination)
            .WithMany()
            .HasForeignKey(p => p.DestinationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Representative)
            .WithMany(r => r.Packages)
            .HasForeignKey(p => p.RepresentativeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
