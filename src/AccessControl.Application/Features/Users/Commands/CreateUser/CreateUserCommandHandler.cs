using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Users.Dtos;
using AccessControl.Domain.Entities;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Users.Commands.CreateUser;

public sealed class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Result<UserResponse>>
{
    private readonly IUnitOfWork _uow;

    public CreateUserCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<UserResponse>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var exists = await _uow.Users.UserAccountExistsAsync(request.UserAccount, cancellationToken);
        if (exists)
            return Result<UserResponse>.Failure($"El usuario '{request.UserAccount}' ya existe.");

        var role = await _uow.Roles.GetByIdAsync(request.RoleId, cancellationToken);
        if (role is null)
            return Result<UserResponse>.Failure("El rol especificado no existe.");

        // Hash de contraseña — BCrypt (subfase 1.6 añadirá el servicio; aquí se hashea directamente)
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            UserAccount = request.UserAccount,
            Password = hashedPassword,
            Name = request.Name,
            RoleId = request.RoleId,
            Visible = true,
            UserCreated = request.UserCreated
        };

        await _uow.Users.AddAsync(user, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        var created = await _uow.Users.GetByIdAsync(user.Id, cancellationToken);
        return Result<UserResponse>.Success(created!.ToResponse());
    }
}
