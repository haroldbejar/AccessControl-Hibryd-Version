using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AccessControl.Domain.Entities;

namespace AccessControl.Domain.Interfaces
{
    public interface IRepresentativeRepository : IRepository<Representative>
    {
        Task<IEnumerable<Representative>> GetByDestinationIdAsync(int destinationId, CancellationToken cancellationToken = default);
    }
}