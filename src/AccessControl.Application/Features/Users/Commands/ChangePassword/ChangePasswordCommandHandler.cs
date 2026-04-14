using AccessControl.Application.Common.Models;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Users.Commands.ChangePassword;

internal sealed class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Result>
{
    private readonly IUnitOfWork _uow;

    public ChangePasswordCommandHandler(IUnitOfWork uow) => _uow = uow;

    public async Task<Result> Handle(ChangePasswordCommand request, CancellationToken ct)
    {
        var user = await _uow.Users.GetByIdAsync(request.Id, ct);
        if (user is null)
            return Result.Failure("Usuario no encontrado.");

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.Password))
            return Result.Failure("La contraseña actual es incorrecta.");

        user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UserModified = request.Id;

        await _uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}
