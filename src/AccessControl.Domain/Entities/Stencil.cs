using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AccessControl.Domain.Common;

namespace AccessControl.Domain.Entities
{
    /// <summary>
    /// Representa una plantilla del sistema
    /// </summary>
    [Table("Stencils")]
    public class Stencil : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }
    }
}