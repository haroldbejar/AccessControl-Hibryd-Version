using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AccessControl.Domain.Common;

namespace AccessControl.Domain.Entities
{
    /// <summary>
    /// Representa un destino dentro del conjunto (apartamento, torre, oficina)
    /// </summary>
    [Table("Destinations")]
    public class Destination : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        // Relaciones
        public virtual ICollection<Representative> Representatives { get; set; } = new List<Representative>();
    }
}