using System;

namespace AccessControl.Domain.Exceptions
{
    public class EntityNotFoundException : DomainException
    {
        public EntityNotFoundException(string entityName, object key)
            : base($"Entity \"{entityName}\" ({key}) was not found.")
        {
        }
    }
}