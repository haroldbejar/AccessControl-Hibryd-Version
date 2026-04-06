using AccessControl.Application.Common.Models;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Visits.Commands.CheckOutVisit;

public sealed class CheckOutVisitCommandHandler : IRequestHandler<CheckOutVisitCommand, Result>
{
    private readonly IUnitOfWork _uow;

    public CheckOutVisitCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result> Handle(CheckOutVisitCommand request, CancellationToken cancellationToken)
    {
        var visit = await _uow.Visits.GetByDocumentNumberAsync(request.DocumentNumber, cancellationToken);

        if (visit is null)
            return Result.Failure($"No se encontró una visita activa para el documento '{request.DocumentNumber}'.");

        if (visit.CheckOut.HasValue)
            return Result.Failure("La visita ya registró su salida.");

        visit.CheckOut = DateTime.UtcNow;
        visit.UserModified = request.UserModified;

        await _uow.Visits.UpdateAsync(visit, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
