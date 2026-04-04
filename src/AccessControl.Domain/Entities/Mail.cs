using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AccessControl.Domain.Common;

namespace AccessControl.Domain.Entities
{
    /// <summary>
    /// Representa una configuración de correo electrónico
    /// </summary>
    [Table("Mails")]
    public class Mail : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Email { get; set; }
    }
}