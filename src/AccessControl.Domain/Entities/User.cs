using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AccessControl.Domain.Common;

namespace AccessControl.Domain.Entities
{
    /// <summary>
    /// Representa un usuario del sistema
    /// </summary>
    [Table("Users")]
    public class User : BaseEntity
    {
        [Required]
        [MaxLength(50)]
        public string UserAccount { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [ForeignKey(nameof(Role))]
        public int RoleId { get; set; }
        public virtual Role Role { get; set; } = null!;

        public bool Visible { get; set; } = true;
    }
}