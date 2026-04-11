using AccessControl.Domain.Interfaces;
using AccessControl.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore.Storage;

namespace AccessControl.Infrastructure.Persistence;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    private IDbContextTransaction? _transaction;

    // Repositorios con inicialización lazy
    private IVisitRepository? _visits;
    private IPackageRepository? _packages;
    private IUserRepository? _users;
    private IRepresentativeRepository? _representatives;
    private IDestinationRepository? _destinations;
    private IRoleRepository? _roles;
    private ICommonAreaRepository? _commonAreas;
    private IReservationRepository? _reservations;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    public IVisitRepository Visits
        => _visits ??= new VisitRepository(_context);

    public IPackageRepository Packages
        => _packages ??= new PackageRepository(_context);

    public IUserRepository Users
        => _users ??= new UserRepository(_context);

    public IRepresentativeRepository Representatives
        => _representatives ??= new RepresentativeRepository(_context);

    public IDestinationRepository Destinations
        => _destinations ??= new DestinationRepository(_context);

    public IRoleRepository Roles
        => _roles ??= new RoleRepository(_context);

    public ICommonAreaRepository CommonAreas
        => _commonAreas ??= new CommonAreaRepository(_context);

    public IReservationRepository Reservations
        => _reservations ??= new ReservationRepository(_context);

    // --- Persistencia ---

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await _context.SaveChangesAsync(cancellationToken);

    // --- Transacciones explícitas ---

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
        => _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is null)
            throw new InvalidOperationException("No hay ninguna transacción activa.");

        await _transaction.CommitAsync(cancellationToken);
        await _transaction.DisposeAsync();
        _transaction = null;
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is null)
            throw new InvalidOperationException("No hay ninguna transacción activa.");

        await _transaction.RollbackAsync(cancellationToken);
        await _transaction.DisposeAsync();
        _transaction = null;
    }

    // --- Dispose ---

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}
