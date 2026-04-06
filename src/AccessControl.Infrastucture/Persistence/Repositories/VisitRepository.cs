using AccessControl.Domain.Entities;
using AccessControl.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AccessControl.Infrastructure.Persistence.Repositories;

public sealed class VisitRepository : GenericRepository<Visit>, IVisitRepository
{
    public VisitRepository(AppDbContext context) : base(context) { }

    /// <summary>
    /// Devuelve la visita activa (sin checkout) que coincide con el número de documento.
    /// </summary>
    public async Task<Visit?> GetByDocumentNumberAsync(
        string documentNumber,
        CancellationToken cancellationToken = default)
        => await _dbSet
            .Include(v => v.Representative)
            .FirstOrDefaultAsync(
                v => v.DocumentNumber == documentNumber && v.CheckOut == null,
                cancellationToken);

    /// <summary>
    /// Devuelve la visita más reciente (con o sin checkout) para el documento dado.
    /// </summary>
    public async Task<Visit?> GetByDocumentNumberCheckOutAsync(
        string documentNumber,
        CancellationToken cancellationToken = default)
        => await _dbSet
            .Include(v => v.Representative)
            .Where(v => v.DocumentNumber == documentNumber)
            .OrderByDescending(v => v.CheckIn)
            .FirstOrDefaultAsync(cancellationToken);

    /// <summary>
    /// Filtra visitas por rango de fecha, documento, nombre y/o destino.
    /// </summary>
    public async Task<IEnumerable<Visit>> GetAllFilteredAsync(
        DateTime startDate,
        DateTime endDate,
        string? documentFilter,
        string? nameFilter,
        int? destinationFilter,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .AsNoTracking()
            .Include(v => v.Representative)
                .ThenInclude(r => r.Destination)
            .Where(v => v.CheckIn >= startDate && v.CheckIn <= endDate);

        if (!string.IsNullOrWhiteSpace(documentFilter))
            query = query.Where(v => v.DocumentNumber.Contains(documentFilter));

        if (!string.IsNullOrWhiteSpace(nameFilter))
            query = query.Where(v => v.FullName.Contains(nameFilter));

        if (destinationFilter.HasValue)
            query = query.Where(v => v.Representative.DestinationId == destinationFilter.Value);

        return await query
            .OrderByDescending(v => v.CheckIn)
            .ToListAsync(cancellationToken);
    }
}
