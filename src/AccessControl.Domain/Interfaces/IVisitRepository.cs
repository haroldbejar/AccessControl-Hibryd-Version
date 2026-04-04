using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AccessControl.Domain.Entities;

namespace AccessControl.Domain.Interfaces
{
    /// <summary>
    /// Interfaz específica para el repositorio de visitas
    /// </summary>
    public interface IVisitRepository : IRepository<Visit>
    {
        Task<Visit?> GetByDocumentNumberAsync(string documentNumber, CancellationToken cancellationToken = default);
        Task<Visit?> GetByDocumentNumberCheckOutAsync(string documentNumber, CancellationToken cancellationToken = default);
        Task<IEnumerable<Visit>> GetAllFilteredAsync(
            DateTime startDate,
            DateTime endDate,
            string? documentFilter,
            string? nameFilter,
            int? destinationFilter,
            CancellationToken cancellationToken = default);
    }
}