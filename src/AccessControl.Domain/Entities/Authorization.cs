using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AccessControl.Domain.Common;

namespace AccessControl.Domain.Entities
{
    /// <summary>
    /// Representa permisos de acceso por rol y menú (RBAC)
    /// </summary>
    [Table("Authorizations")]
    public class Authorization : BaseEntity
    {
        [Required]
        [ForeignKey(nameof(Role))]
        public int RoleId { get; set; }
        public virtual Role Role { get; set; } = null!;

        [Required]
        [ForeignKey(nameof(Menu))]
        public int MenuId { get; set; }
        public virtual Menu Menu { get; set; } = null!;

        // Permisos CRUD
        public bool Create { get; set; }
        public bool Read { get; set; }
        public bool Update { get; set; }
        public bool Delete { get; set; }
    }
}