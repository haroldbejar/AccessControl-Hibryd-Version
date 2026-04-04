using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AccessControl.Domain.Common;

namespace AccessControl.Domain.Entities
{
    /// <summary>
    /// Representa un rol de usuario en el sistema
    /// </summary>
    [Table("Roles")]
    public class Role : BaseEntity
    {
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        public bool Visible { get; set; } = true;

        // Relaciones
        public virtual ICollection<User> Users { get; set; } = new List<User>();
        public virtual ICollection<Authorization> Authorizations { get; set; } = new List<Authorization>();
    }
}