using AccessControl.Domain.Entities;
using AccessControl.Domain.Enums;

namespace AccessControl.Domain.Interfaces
{
    /// <summary>
    /// Repositorio específico para reservas de zonas comunes
    /// </summary>
    public interface IReservationRepository : IRepository<Reservation>
    {
        Task<IEnumerable<Reservation>> GetAllFilteredAsync(
            DateOnly? date,
            int? commonAreaId,
            ReservationStatusEnum? status,
            CancellationToken cancellationToken = default);

        Task<IEnumerable<Reservation>> GetByDateAndAreaAsync(
            DateOnly date,
            int commonAreaId,
            CancellationToken cancellationToken = default);

        Task<bool> HasOverlapAsync(
            int commonAreaId,
            DateOnly date,
            TimeOnly start,
            TimeOnly end,
            int? excludeId = null,
            CancellationToken cancellationToken = default);
    }
}
