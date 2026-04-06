using AccessControl.Application.Common.Interfaces;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Auth.Dtos;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Auth.Commands.Login;

public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, Result<LoginResponse>>
{
    private readonly IUnitOfWork _uow;
    private readonly IJwtTokenService _jwtTokenService;

    public LoginCommandHandler(IUnitOfWork uow, IJwtTokenService jwtTokenService)
    {
        _uow = uow;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<Result<LoginResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _uow.Users.GetByUserAccountAsync(request.UserAccount, cancellationToken);

        if (user is null || !user.Visible)
            return Result<LoginResponse>.Failure("Credenciales inválidas.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            return Result<LoginResponse>.Failure("Credenciales inválidas.");

        var (token, expiration) = _jwtTokenService.GenerateToken(
            user.Id, user.UserAccount, user.Role?.Name ?? string.Empty);

        var response = new LoginResponse(
            UserId: user.Id,
            UserAccount: user.UserAccount,
            Name: user.Name,
            RoleId: user.RoleId,
            RoleName: user.Role?.Name ?? string.Empty,
            Token: token,
            Expiration: expiration
        );

        return Result<LoginResponse>.Success(response);
    }
}
