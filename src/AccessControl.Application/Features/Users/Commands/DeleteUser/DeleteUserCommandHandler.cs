using AccessControl.Application.Common.Models;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Users.Commands.DeleteUser;

public sealed class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, Result>
{
    private readonly IUnitOfWork _uow;

    public DeleteUserCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _uow.Users.GetByIdAsync(request.Id, cancellationToken);

        if (user is null)
            return Result.Failure($"Usuario con Id {request.Id} no encontrado.");

        user.UserEliminated = request.UserEliminated;

        await _uow.Users.DeleteAsync(user, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
