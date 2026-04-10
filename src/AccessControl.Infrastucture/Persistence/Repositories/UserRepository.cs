using AccessControl.Domain.Entities;
using AccessControl.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AccessControl.Infrastructure.Persistence.Repositories;

public sealed class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context) { }

    public override async Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _dbSet
            .Include(u => u.Role)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

    public async Task<User?> GetByUserAccountAsync(
        string userAccount,
        CancellationToken cancellationToken = default)
        => await _dbSet
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserAccount == userAccount, cancellationToken);

    /// <summary>
    /// Devuelve el usuario si la cuenta y la contraseña (ya hasheada por la capa de aplicación)
    /// coinciden y el usuario está visible (activo).
    /// </summary>
    public async Task<User?> LoginAsync(
        string userAccount,
        string encryptedPassword,
        CancellationToken cancellationToken = default)
        => await _dbSet
            .Include(u => u.Role)
            .FirstOrDefaultAsync(
                u => u.UserAccount == userAccount
                  && u.Password == encryptedPassword
                  && u.Visible,
                cancellationToken);

    public async Task<bool> UserAccountExistsAsync(
        string userAccount,
        CancellationToken cancellationToken = default)
        => await _dbSet.AnyAsync(u => u.UserAccount == userAccount, cancellationToken);
}
