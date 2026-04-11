using AccessControl.Domain.Entities;
using AccessControl.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccessControl.Infrastructure.Persistence.Configurations;

public sealed class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
{
    public void Configure(EntityTypeBuilder<Reservation> builder)
    {
        builder.ToTable("Reservations");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.ReservationDate)
            .HasColumnType("date");

        builder.Property(r => r.StartTime)
            .HasColumnType("time");

        builder.Property(r => r.EndTime)
            .HasColumnType("time");

        builder.Property(r => r.Status)
            .HasConversion<int>()
            .HasDefaultValue(ReservationStatusEnum.Pending);

        builder.Property(r => r.Notes)
            .HasMaxLength(500);

        builder.Property(r => r.CancellationReason)
            .HasMaxLength(500);

        // Propiedad calculada — ignorada en BD
        builder.Ignore(r => r.StatusDescription);

        // FK → CommonArea
        builder.HasOne(r => r.CommonArea)
            .WithMany(c => c.Reservations)
            .HasForeignKey(r => r.CommonAreaId)
            .OnDelete(DeleteBehavior.Restrict);

        // FK → Destination
        builder.HasOne(r => r.Destination)
            .WithMany()
            .HasForeignKey(r => r.DestinationId)
            .OnDelete(DeleteBehavior.Restrict);

        // FK → Representative
        builder.HasOne(r => r.Representative)
            .WithMany()
            .HasForeignKey(r => r.RepresentativeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Índice compuesto para consultas de disponibilidad
        builder.HasIndex(r => new { r.CommonAreaId, r.ReservationDate });

        // Auditoría
        builder.Property(r => r.CreatedDate).IsRequired();
        builder.Property(r => r.Eliminated).HasDefaultValue(false);
    }
}
