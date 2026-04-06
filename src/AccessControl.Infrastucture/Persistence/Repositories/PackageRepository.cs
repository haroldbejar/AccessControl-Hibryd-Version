using AccessControl.Domain.Entities;
using AccessControl.Domain.Enums;
using AccessControl.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AccessControl.Infrastructure.Persistence.Repositories;

public sealed class PackageRepository : GenericRepository<Package>, IPackageRepository
{
    public PackageRepository(AppDbContext context) : base(context) { }

    /// <summary>
    /// Filtra paquetes por rango de fecha, número de control, remitente, destino y estado.
    /// </summary>
    public async Task<IEnumerable<Package>> GetAllFilteredAsync(
        DateTime startDate,
        DateTime endDate,
        string? controlNumber,
        string? senderName,
        int? destinationId,
        PackagesStatusEnum? status,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .AsNoTracking()
            .Include(p => p.Destination)
            .Include(p => p.Representative)
            .Where(p => p.ReceivedDate >= startDate && p.ReceivedDate <= endDate);

        if (!string.IsNullOrWhiteSpace(controlNumber))
            query = query.Where(p => p.ControlNumber.Contains(controlNumber));

        if (!string.IsNullOrWhiteSpace(senderName))
            query = query.Where(p => p.SenderName.Contains(senderName));

        if (destinationId.HasValue)
            query = query.Where(p => p.DestinationId == destinationId.Value);

        if (status.HasValue)
            query = query.Where(p => p.Status == status.Value);

        return await query
            .OrderByDescending(p => p.ReceivedDate)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Devuelve paquetes con estado Received (pendientes de entrega).
    /// </summary>
    public async Task<IEnumerable<Package>> GetPendingPackagesAsync(
        CancellationToken cancellationToken = default)
        => await _dbSet
            .AsNoTracking()
            .Include(p => p.Destination)
            .Include(p => p.Representative)
            .Where(p => p.Status == PackagesStatusEnum.Received)
            .OrderByDescending(p => p.ReceivedDate)
            .ToListAsync(cancellationToken);

    /// <summary>
    /// Registra la entrega de un paquete. Modifica la entidad y persiste el cambio.
    /// Devuelve false si el paquete no existe o ya fue entregado.
    /// </summary>
    public async Task<bool> DeliverPackageAsync(
        int packageId,
        string deliveredTo,
        string deliveredToDocument,
        byte[]? deliverySignature,
        int userId,
        CancellationToken cancellationToken = default)
    {
        var package = await _dbSet
            .FirstOrDefaultAsync(p => p.Id == packageId, cancellationToken);

        if (package is null || package.Status == PackagesStatusEnum.Delivered)
            return false;

        package.Status = PackagesStatusEnum.Delivered;
        package.DeliveryDate = DateTime.UtcNow;
        package.DeliveredTo = deliveredTo;
        package.DeliveredToDocument = deliveredToDocument;
        package.DeliverySignature = deliverySignature;
        package.UserModified = userId;

        _dbSet.Update(package);
        return true;
    }
}
