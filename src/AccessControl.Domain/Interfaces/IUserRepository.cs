using System.Threading;
using System.Threading.Tasks;
using AccessControl.Domain.Entities;

namespace AccessControl.Domain.Interfaces
{
    /// <summary>
    /// Interfaz específica para el repositorio de usuarios
    /// </summary>
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByUserAccountAsync(string userAccount, CancellationToken cancellationToken = default);
        Task<User?> LoginAsync(string userAccount, string encryptedPassword, CancellationToken cancellationToken = default);
        Task<bool> UserAccountExistsAsync(string userAccount, CancellationToken cancellationToken = default);
    }
}