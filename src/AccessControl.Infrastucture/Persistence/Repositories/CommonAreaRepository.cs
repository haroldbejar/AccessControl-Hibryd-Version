using AccessControl.Domain.Entities;
using AccessControl.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AccessControl.Infrastructure.Persistence.Repositories;

public sealed class CommonAreaRepository : GenericRepository<CommonArea>, ICommonAreaRepository
{
    public CommonAreaRepository(AppDbContext context) : base(context) { }

    /// <summary>
    /// Devuelve todas las zonas comunes que no han sido eliminadas (soft delete).
    /// El filtro global de AppDbContext ya aplica !Eliminated, así que este override
    /// es consistente con el resto de repositorios pero explícito para claridad.
    /// </summary>
    public override async Task<IEnumerable<CommonArea>> GetAllAsync(
        CancellationToken cancellationToken = default)
        => await _dbSet
            .AsNoTracking()
            .Where(c => !c.Eliminated)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
}
