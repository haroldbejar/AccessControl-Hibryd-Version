using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Auth.Dtos;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Auth.Commands.Login;

public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, Result<LoginResponse>>
{
    private readonly IUnitOfWork _uow;

    public LoginCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<LoginResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // Obtener usuario por cuenta (incluye Role)
        var user = await _uow.Users.GetByUserAccountAsync(request.UserAccount, cancellationToken);

        if (user is null || !user.Visible)
            return Result<LoginResponse>.Failure("Credenciales inválidas.");

        // Verificar contraseña con BCrypt
        var passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);
        if (!passwordValid)
            return Result<LoginResponse>.Failure("Credenciales inválidas.");

        // Token se genera en Subfase 1.6 (JwtService); por ahora se retorna vacío
        var response = new LoginResponse(
            UserId: user.Id,
            UserAccount: user.UserAccount,
            Name: user.Name,
            RoleId: user.RoleId,
            RoleName: user.Role?.Name ?? string.Empty,
            Token: string.Empty
        );

        return Result<LoginResponse>.Success(response);
    }
}
