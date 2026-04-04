using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AccessControl.Domain.Entities;

namespace AccessControl.Domain.Interfaces
{
    public interface IDestinationRepository : IRepository<Destination>
    {
        Task<IEnumerable<Destination>> GetAllWithRepresentativesAsync(CancellationToken cancellationToken = default);
    }
}