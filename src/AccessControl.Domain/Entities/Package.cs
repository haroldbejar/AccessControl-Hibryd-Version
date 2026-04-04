using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AccessControl.Domain.Common;
using AccessControl.Domain.Enums;

namespace AccessControl.Domain.Entities
{
    /// <summary>
    /// Representa un paquete o domicilio recibido en el conjunto
    /// </summary>
    [Table("Packages")]
    public class Package : BaseEntity
    {
        // Control
        [Required]
        [MaxLength(20)]
        public string ControlNumber { get; set; } = string.Empty;

        // Remitente
        [Required]
        [MaxLength(100)]
        public string SenderName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? SenderCompany { get; set; }

        [MaxLength(50)]
        public string? TrackingNumber { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        // Recepción
        [Required]
        public DateTime ReceivedDate { get; set; } = DateTime.Now;

        [Required]
        [MaxLength(100)]
        public string ReceivedBy { get; set; } = string.Empty;

        public byte[]? Photo { get; set; }
        public byte[]? ReceiverSignature { get; set; }

        // Destino
        [Required]
        [ForeignKey(nameof(Destination))]
        public int DestinationId { get; set; }
        public virtual Destination Destination { get; set; } = null!;

        [Required]
        [ForeignKey(nameof(Representative))]
        public int RepresentativeId { get; set; }
        public virtual Representative Representative { get; set; } = null!;

        // Entrega
        public DateTime? DeliveryDate { get; set; }

        [MaxLength(100)]
        public string? DeliveredTo { get; set; }

        [MaxLength(20)]
        public string? DeliveredToDocument { get; set; }

        public byte[]? DeliverySignature { get; set; }

        // Estado
        [Required]
        public PackagesStatusEnum Status { get; set; } = PackagesStatusEnum.Received;

        [MaxLength(500)]
        public string? Notes { get; set; }

        // Propiedades Calculadas
        [NotMapped]
        public string StatusDescription => Status switch
        {
            PackagesStatusEnum.Received => "Recibido",
            PackagesStatusEnum.Delivered => "Entregado",
            _ => "Desconocido"
        };

        [NotMapped]
        public bool IsPending => Status == PackagesStatusEnum.Received && !Eliminated;

        // Constructor
        public Package()
        {
            ReceivedDate = DateTime.Now;
            Status = PackagesStatusEnum.Received;
        }
    }
}