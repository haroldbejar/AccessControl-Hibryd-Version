using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Visits.Dtos;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Visits.Queries.GetVisitById;

public sealed class GetVisitByIdQueryHandler : IRequestHandler<GetVisitByIdQuery, Result<VisitResponse>>
{
    private readonly IUnitOfWork _uow;

    public GetVisitByIdQueryHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<VisitResponse>> Handle(GetVisitByIdQuery request, CancellationToken cancellationToken)
    {
        var visit = await _uow.Visits.GetByIdAsync(request.Id, cancellationToken);

        if (visit is null)
            return Result<VisitResponse>.Failure($"Visita con Id {request.Id} no encontrada.");

        return Result<VisitResponse>.Success(visit.ToResponse());
    }
}
