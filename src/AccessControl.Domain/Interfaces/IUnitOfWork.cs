using System;
using System.Threading;
using System.Threading.Tasks;

namespace AccessControl.Domain.Interfaces
{
    /// <summary>
    /// Unit of Work para coordinar transacciones entre repositorios
    /// </summary>
    public interface IUnitOfWork : IDisposable
    {
        // Repositorios
        IVisitRepository Visits { get; }
        IPackageRepository Packages { get; }
        IUserRepository Users { get; }
        IRepresentativeRepository Representatives { get; }
        IDestinationRepository Destinations { get; }
        IRoleRepository Roles { get; }
        ICommonAreaRepository CommonAreas { get; }
        IReservationRepository Reservations { get; }

        // Transacciones
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
        Task BeginTransactionAsync(CancellationToken cancellationToken = default);
        Task CommitTransactionAsync(CancellationToken cancellationToken = default);
        Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
    }
}