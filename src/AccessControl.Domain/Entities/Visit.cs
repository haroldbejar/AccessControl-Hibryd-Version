using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AccessControl.Domain.Common;
using AccessControl.Domain.Enums;

namespace AccessControl.Domain.Entities
{
    /// <summary>
    /// Representa una visita en el sistema de control de acceso.
    /// </summary>
    [Table("Visits")]
    public class Visit : BaseEntity
    {
        // Datos personales del visitante
        [Required]
        [MaxLength(20)]
        public string DocumentNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? SecondName { get; set; }

        [Required]
        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? SecondLastName { get; set; }

        [MaxLength(200)]
        public string FullName { get; set; } = string.Empty;

        // Relación con Representante
        [Required]
        [ForeignKey(nameof(Representative))]
        public int RepresentativeId { get; set; }
        public virtual Representative Representative { get; set; } = null!;

        // Datos de Vehículo
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

        // Control de Acceso
        public DateTime CheckIn { get; set; } = DateTime.Now;
        public DateTime? CheckOut { get; set; }

        /// <summary>
        /// Fotografía del visitante almacenada como byte array
        /// </summary>
        public byte[]? Photo { get; set; }

        public byte[]? Photo2 { get; set; }

        // Propiedades Calculadas (No mapeadas a BD)
        [NotMapped]
        public bool IsCheckedOut => CheckOut.HasValue;

        [NotMapped]
        public string VehicleTypeName => VehicleTypeId switch
        {
            VehicleTypeEnum.NA => "No Aplica",
            VehicleTypeEnum.Car => "Carro",
            VehicleTypeEnum.Motorcycle => "Moto",
            VehicleTypeEnum.Bicycle => "Bicicleta",
            _ => "No Aplica"
        };

        // Constructor
        public Visit()
        {
            CheckIn = DateTime.Now;
            CreatedDate = DateTime.Now;
            ModifiedDate = DateTime.Now;
        }
    }
}