using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AccessControl.Domain.Common;
using AccessControl.Domain.Enums;

namespace AccessControl.Domain.Entities
{
    /// <summary>
    /// Representa un representante o residente que puede recibir visitas
    /// </summary>
    [Table("Representatives")]
    public class Representative : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(15)]
        public string? Phone { get; set; }

        [MaxLength(15)]
        public string? CellPhone { get; set; }

        // Relación con Destino
        [Required]
        [ForeignKey(nameof(Destination))]
        public int DestinationId { get; set; }
        public virtual Destination Destination { get; set; } = null!;

        // Datos de Vehículo (opcional)
        public bool HasVehicle { get; set; }
        public VehicleTypeEnum VehicleTypeId { get; set; } = VehicleTypeEnum.NA;

        [MaxLength(50)]
        public string? Brand { get; set; }

        [MaxLength(50)]
        public string? Model { get; set; }

        [MaxLength(30)]
        public string? Color { get; set; }

        [MaxLength(20)]
        public string? Plate { get; set; }

        // Tipo de representante y datos de contrato
        public RepresentativeTypeEnum RepresentativeType { get; set; } = RepresentativeTypeEnum.Owner;
        public DateOnly? ContractEndDate { get; set; }

        [NotMapped]
        public string RepresentativeTypeDescription => RepresentativeType switch
        {
            RepresentativeTypeEnum.Owner => "Propietario",
            RepresentativeTypeEnum.Tenant => "Arrendatario",
            _ => "Desconocido"
        };

        [NotMapped]
        public bool Visible => !Eliminated;

        // Relaciones
        public virtual ICollection<Visit> Visits { get; set; } = new List<Visit>();
        public virtual ICollection<Package> Packages { get; set; } = new List<Package>();
    }
}