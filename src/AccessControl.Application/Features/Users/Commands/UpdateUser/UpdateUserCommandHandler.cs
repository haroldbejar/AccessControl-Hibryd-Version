using AccessControl.Application.Common.Models;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Users.Commands.UpdateUser;

public sealed class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, Result>
{
    private readonly IUnitOfWork _uow;

    public UpdateUserCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _uow.Users.GetByIdAsync(request.Id, cancellationToken);
        if (user is null)
            return Result.Failure($"Usuario con Id {request.Id} no encontrado.");

        var role = await _uow.Roles.GetByIdAsync(request.RoleId, cancellationToken);
        if (role is null)
            return Result.Failure("El rol especificado no existe.");

        user.Name = request.Name;
        user.RoleId = request.RoleId;
        user.Visible = request.Visible;
        user.UserModified = request.UserModified;

        await _uow.Users.UpdateAsync(user, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
