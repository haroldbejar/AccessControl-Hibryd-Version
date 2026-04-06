using AccessControl.Application.Common.Models;
using AccessControl.Domain.Entities;
using AccessControl.Domain.Exceptions;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Representatives.Commands.DeleteRepresentative;

public sealed class DeleteRepresentativeCommandHandler : IRequestHandler<DeleteRepresentativeCommand, Result>
{
    private readonly IUnitOfWork _uow;

    public DeleteRepresentativeCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result> Handle(DeleteRepresentativeCommand request, CancellationToken cancellationToken)
    {
        var representative = await _uow.Representatives.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(Representative), request.Id);

        await _uow.Representatives.DeleteAsync(representative, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
