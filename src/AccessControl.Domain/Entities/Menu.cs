using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AccessControl.Domain.Common;

namespace AccessControl.Domain.Entities
{
    /// <summary>
    /// Representa un menú o sección del sistema
    /// </summary>
    [Table("Menus")]
    public class Menu : BaseEntity
    {
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Page { get; set; }

        [MaxLength(50)]
        public string? Icon { get; set; }

        // Relaciones
        public virtual ICollection<Authorization> Authorizations { get; set; } = new List<Authorization>();
    }
}