using AccessControl.Domain.Entities;
using AccessControl.Domain.Interfaces;

namespace AccessControl.Infrastructure.Persistence.Repositories;

public sealed class AuthorizationRepository : GenericRepository<Authorization>, IAuthorizationRepository
{
    public AuthorizationRepository(AppDbContext context) : base(context) { }
}
