using AccessControl.Domain.Entities;
using AccessControl.Domain.Interfaces;

namespace AccessControl.Infrastructure.Persistence.Repositories;

public sealed class RoleRepository : GenericRepository<Role>, IRoleRepository
{
    public RoleRepository(AppDbContext context) : base(context) { }
}
