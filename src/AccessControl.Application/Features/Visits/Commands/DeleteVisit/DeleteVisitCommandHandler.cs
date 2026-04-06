using AccessControl.Application.Common.Models;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Visits.Commands.DeleteVisit;

public sealed class DeleteVisitCommandHandler : IRequestHandler<DeleteVisitCommand, Result>
{
    private readonly IUnitOfWork _uow;

    public DeleteVisitCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result> Handle(DeleteVisitCommand request, CancellationToken cancellationToken)
    {
        var visit = await _uow.Visits.GetByIdAsync(request.Id, cancellationToken);

        if (visit is null)
            return Result.Failure($"Visita con Id {request.Id} no encontrada.");

        visit.UserEliminated = request.UserEliminated;

        await _uow.Visits.DeleteAsync(visit, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
