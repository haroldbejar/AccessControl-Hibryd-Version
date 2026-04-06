using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Visits.Dtos;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Visits.Queries.GetVisitByDocument;

public sealed class GetVisitByDocumentQueryHandler : IRequestHandler<GetVisitByDocumentQuery, Result<VisitResponse>>
{
    private readonly IUnitOfWork _uow;

    public GetVisitByDocumentQueryHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<VisitResponse>> Handle(GetVisitByDocumentQuery request, CancellationToken cancellationToken)
    {
        var visit = await _uow.Visits.GetByDocumentNumberAsync(request.DocumentNumber, cancellationToken);

        if (visit is null)
            return Result<VisitResponse>.Failure($"No se encontró visita activa para el documento '{request.DocumentNumber}'.");

        return Result<VisitResponse>.Success(visit.ToResponse());
    }
}
