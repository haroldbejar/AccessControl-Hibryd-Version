using AccessControl.Domain.Entities;
using AccessControl.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AccessControl.Infrastructure.Persistence.Repositories;

public sealed class RepresentativeRepository : GenericRepository<Representative>, IRepresentativeRepository
{
    public RepresentativeRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Representative>> GetByDestinationIdAsync(
        int destinationId,
        CancellationToken cancellationToken = default)
        => await _dbSet
            .AsNoTracking()
            .Include(r => r.Destination)
            .Where(r => r.DestinationId == destinationId)
            .OrderBy(r => r.Name)
            .ToListAsync(cancellationToken);
}
