using AccessControl.Domain.Entities;
using AccessControl.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccessControl.Infrastructure.Persistence.Configurations;

public sealed class RepresentativeConfiguration : IEntityTypeConfiguration<Representative>
{
    public void Configure(EntityTypeBuilder<Representative> builder)
    {
        builder.ToTable("Representatives");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(r => r.Phone).HasMaxLength(15);
        builder.Property(r => r.CellPhone).HasMaxLength(15);

        // Vehículo
        builder.Property(r => r.VehicleTypeId)
            .HasConversion<int>()
            .HasDefaultValue(VehicleTypeEnum.NA);

        builder.Property(r => r.Brand).HasMaxLength(50);
        builder.Property(r => r.Model).HasMaxLength(50);
        builder.Property(r => r.Color).HasMaxLength(30);
        builder.Property(r => r.Plate).HasMaxLength(20);

        // Tipo de representante y contrato
        builder.Property(r => r.RepresentativeType)
            .HasConversion<int>()
            .HasColumnName("RepresentativeType")
            .HasDefaultValue(RepresentativeTypeEnum.Owner);

        builder.Property(r => r.ContractEndDate)
            .HasColumnType("date")
            .HasColumnName("ContractEndDate")
            .IsRequired(false);

        // Auditoría
        builder.Property(r => r.CreatedDate).IsRequired();
        builder.Property(r => r.Eliminated).HasDefaultValue(false);

        builder.HasIndex(r => r.DestinationId);

        // Relación con Destination
        builder.HasOne(r => r.Destination)
            .WithMany(d => d.Representatives)
            .HasForeignKey(r => r.DestinationId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
