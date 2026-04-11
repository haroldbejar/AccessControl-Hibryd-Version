using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AccessControl.Domain.Common;

namespace AccessControl.Domain.Entities
{
    /// <summary>
    /// Representa una zona común reservable (salón comunal, BBQ, zona de juegos, etc.)
    /// </summary>
    [Table("CommonAreas")]
    public class CommonArea : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public int? Capacity { get; set; }

        [MaxLength(200)]
        public string? Location { get; set; }

        public TimeOnly OpeningTime { get; set; }

        public TimeOnly ClosingTime { get; set; }

        // Navigation
        public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();

        [NotMapped]
        public bool IsAvailable => !Eliminated;
    }
}
