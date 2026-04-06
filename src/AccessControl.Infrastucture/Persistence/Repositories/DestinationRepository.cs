using AccessControl.Domain.Entities;
using AccessControl.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AccessControl.Infrastructure.Persistence.Repositories;

public sealed class DestinationRepository : GenericRepository<Destination>, IDestinationRepository
{
    public DestinationRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Destination>> GetAllWithRepresentativesAsync(
        CancellationToken cancellationToken = default)
        => await _dbSet
            .AsNoTracking()
            .Include(d => d.Representatives)
            .OrderBy(d => d.Name)
            .ToListAsync(cancellationToken);
}
