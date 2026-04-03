using System;
using System.ComponentModel.DataAnnotations;

namespace AccessControl.Domain.Common
{
    /// <summary>
    /// Clase base para todas las entidades del dominio. 
    /// Proporciona ID y campos de auditoría
    /// </summary>
    public abstract class BaseEntity
    {
        [Key]
        public int Id { get; set; }

        // Auditoría de Creación
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public int UserCreated { get; set; }

        // Auditoría de Modificación
        public DateTime? ModifiedDate { get; set; } = DateTime.UtcNow;
        public int? UserModified { get; set; }

        // Soft Delete
        public bool Eliminated { get; set; } = false;
        public DateTime? EliminatedDate { get; set; }
        public int? UserEliminated { get; set; }

    }
}