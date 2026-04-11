using AccessControl.Domain.Entities;
using AccessControl.Domain.Enums;
using AccessControl.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AccessControl.Infrastructure.Persistence.Repositories;

public sealed class ReservationRepository : GenericRepository<Reservation>, IReservationRepository
{
    public ReservationRepository(AppDbContext context) : base(context) { }

    /// <summary>
    /// Carga todas las reservas incluyendo las navigation properties necesarias para el mapper.
    /// </summary>
    public override async Task<IEnumerable<Reservation>> GetAllAsync(
        CancellationToken cancellationToken = default)
        => await _dbSet
            .AsNoTracking()
            .Include(r => r.CommonArea)
            .Include(r => r.Destination)
            .Include(r => r.Representative)
            .OrderByDescending(r => r.ReservationDate)
                .ThenBy(r => r.StartTime)
            .ToListAsync(cancellationToken);

    /// <summary>
    /// Carga una reserva por Id incluyendo las navigation properties.
    /// </summary>
    public override async Task<Reservation?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
        => await _dbSet
            .Include(r => r.CommonArea)
            .Include(r => r.Destination)
            .Include(r => r.Representative)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

    /// <summary>
    /// Filtra reservas por fecha, zona común y/o estado.
    /// </summary>
    public async Task<IEnumerable<Reservation>> GetAllFilteredAsync(
        DateOnly? date,
        int? commonAreaId,
        ReservationStatusEnum? status,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .AsNoTracking()
            .Include(r => r.CommonArea)
            .Include(r => r.Destination)
            .Include(r => r.Representative)
            .AsQueryable();

        if (date.HasValue)
            query = query.Where(r => r.ReservationDate == date.Value);

        if (commonAreaId.HasValue)
            query = query.Where(r => r.CommonAreaId == commonAreaId.Value);

        if (status.HasValue)
            query = query.Where(r => r.Status == status.Value);

        return await query
            .OrderBy(r => r.ReservationDate)
                .ThenBy(r => r.StartTime)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Devuelve todas las reservas de una zona en una fecha específica (para grilla de disponibilidad).
    /// </summary>
    public async Task<IEnumerable<Reservation>> GetByDateAndAreaAsync(
        DateOnly date,
        int commonAreaId,
        CancellationToken cancellationToken = default)
        => await _dbSet
            .AsNoTracking()
            .Include(r => r.Destination)
            .Include(r => r.Representative)
            .Where(r => r.ReservationDate == date && r.CommonAreaId == commonAreaId)
            .OrderBy(r => r.StartTime)
            .ToListAsync(cancellationToken);

    /// <summary>
    /// Verifica si existe solapamiento de horarios para una zona en una fecha dada.
    /// Excluye reservas canceladas y opcionalmente la reserva con excludeId (para edición).
    /// </summary>
    public async Task<bool> HasOverlapAsync(
        int commonAreaId,
        DateOnly date,
        TimeOnly start,
        TimeOnly end,
        int? excludeId = null,
        CancellationToken cancellationToken = default)
        => await _dbSet.AnyAsync(r =>
            r.CommonAreaId == commonAreaId &&
            r.ReservationDate == date &&
            r.Status != ReservationStatusEnum.Cancelled &&
            r.StartTime < end &&
            r.EndTime > start &&
            (excludeId == null || r.Id != excludeId),
            cancellationToken);
}
