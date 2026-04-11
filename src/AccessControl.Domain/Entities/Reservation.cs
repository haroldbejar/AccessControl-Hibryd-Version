using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AccessControl.Domain.Common;
using AccessControl.Domain.Enums;

namespace AccessControl.Domain.Entities
{
    /// <summary>
    /// Representa una reserva de zona común realizada por un residente
    /// </summary>
    [Table("Reservations")]
    public class Reservation : BaseEntity
    {
        [Required]
        [ForeignKey(nameof(CommonArea))]
        public int CommonAreaId { get; set; }
        public virtual CommonArea CommonArea { get; set; } = null!;

        [Required]
        [ForeignKey(nameof(Destination))]
        public int DestinationId { get; set; }
        public virtual Destination Destination { get; set; } = null!;

        [Required]
        [ForeignKey(nameof(Representative))]
        public int RepresentativeId { get; set; }
        public virtual Representative Representative { get; set; } = null!;

        public DateOnly ReservationDate { get; set; }

        public TimeOnly StartTime { get; set; }

        public TimeOnly EndTime { get; set; }

        public ReservationStatusEnum Status { get; set; } = ReservationStatusEnum.Pending;

        [MaxLength(500)]
        public string? Notes { get; set; }

        [MaxLength(500)]
        public string? CancellationReason { get; set; }

        [NotMapped]
        public string StatusDescription => Status switch
        {
            ReservationStatusEnum.Pending => "Pendiente",
            ReservationStatusEnum.Confirmed => "Confirmada",
            ReservationStatusEnum.Cancelled => "Cancelada",
            ReservationStatusEnum.Completed => "Completada",
            _ => "Desconocido"
        };
    }
}
