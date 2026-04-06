using AccessControl.Application.Common.Models;
using AccessControl.Domain.Entities;
using AccessControl.Domain.Exceptions;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Destinations.Commands.DeleteDestination;

public sealed class DeleteDestinationCommandHandler : IRequestHandler<DeleteDestinationCommand, Result>
{
    private readonly IUnitOfWork _uow;

    public DeleteDestinationCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result> Handle(DeleteDestinationCommand request, CancellationToken cancellationToken)
    {
        var destination = await _uow.Destinations.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(Destination), request.Id);

        await _uow.Destinations.DeleteAsync(destination, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
