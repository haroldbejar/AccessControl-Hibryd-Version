using AccessControl.Domain.Entities;
using AccessControl.Domain.Interfaces;

namespace AccessControl.Infrastructure.Persistence.Repositories;

public sealed class MenuRepository : GenericRepository<Menu>, IMenuRepository
{
    public MenuRepository(AppDbContext context) : base(context) { }
}
