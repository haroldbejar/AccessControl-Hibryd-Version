using AccessControl.Domain.Entities;
using AccessControl.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccessControl.Infrastructure.Persistence.Configurations;

public sealed class VisitConfiguration : IEntityTypeConfiguration<Visit>
{
    public void Configure(EntityTypeBuilder<Visit> builder)
    {
        builder.ToTable("Visits");

        builder.HasKey(v => v.Id);

        // Documento
        builder.Property(v => v.DocumentNumber)
            .IsRequired()
            .HasMaxLength(20);

        // Nombre
        builder.Property(v => v.FirstName)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(v => v.SecondName)
            .HasMaxLength(50);

        builder.Property(v => v.LastName)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(v => v.SecondLastName)
            .HasMaxLength(50);

        builder.Property(v => v.FullName)
            .IsRequired()
            .HasMaxLength(200);

        // Vehículo
        builder.Property(v => v.VehicleTypeId)
            .HasConversion<int>()
            .HasDefaultValue(VehicleTypeEnum.NA);

        builder.Property(v => v.Brand).HasMaxLength(50);
        builder.Property(v => v.Model).HasMaxLength(50);
        builder.Property(v => v.Color).HasMaxLength(30);
        builder.Property(v => v.Plate).HasMaxLength(20);

        // Fotos (LONGBLOB en MySQL)
        builder.Property(v => v.Photo).HasColumnType("longblob");
        builder.Property(v => v.Photo2).HasColumnType("longblob");

        // Propiedades calculadas — ignoradas en BD
        builder.Ignore(v => v.IsCheckedOut);
        builder.Ignore(v => v.VehicleTypeName);

        // Auditoría
        builder.Property(v => v.CreatedDate).IsRequired();
        builder.Property(v => v.Eliminated).HasDefaultValue(false);

        // Índices
        builder.HasIndex(v => v.DocumentNumber);
        builder.HasIndex(v => v.CheckIn);
        builder.HasIndex(v => new { v.Eliminated, v.CheckIn });

        // Relación con Representative
        builder.HasOne(v => v.Representative)
            .WithMany(r => r.Visits)
            .HasForeignKey(v => v.RepresentativeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
