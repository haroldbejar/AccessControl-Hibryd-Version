using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AccessControl.Domain.Entities;
using AccessControl.Domain.Enums;

namespace AccessControl.Domain.Interfaces
{
    /// <summary>
    /// Interfaz específica para el repositorio de paquetes
    /// </summary>
    public interface IPackageRepository : IRepository<Package>
    {
        Task<IEnumerable<Package>> GetAllFilteredAsync(
            DateTime startDate,
            DateTime endDate,
            string? controlNumber,
            string? senderName,
            int? destinationId,
            PackagesStatusEnum? status,
            CancellationToken cancellationToken = default);

        Task<IEnumerable<Package>> GetPendingPackagesAsync(CancellationToken cancellationToken = default);

        Task<bool> DeliverPackageAsync(
            int packageId,
            string deliveredTo,
            string deliveredToDocument,
            byte[]? deliverySignature,
            int userId,
            CancellationToken cancellationToken = default);
    }
}