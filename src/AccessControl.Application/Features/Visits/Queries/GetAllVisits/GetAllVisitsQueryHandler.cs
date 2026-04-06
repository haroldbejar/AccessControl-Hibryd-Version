using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Visits.Dtos;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Visits.Queries.GetAllVisits;

public sealed class GetAllVisitsQueryHandler : IRequestHandler<GetAllVisitsQuery, Result<IEnumerable<VisitResponse>>>
{
    private readonly IUnitOfWork _uow;

    public GetAllVisitsQueryHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<IEnumerable<VisitResponse>>> Handle(
        GetAllVisitsQuery request,
        CancellationToken cancellationToken)
    {
        var visits = await _uow.Visits.GetAllFilteredAsync(
            request.StartDate,
            request.EndDate,
            request.DocumentFilter,
            request.NameFilter,
            request.DestinationFilter,
            cancellationToken);

        return Result<IEnumerable<VisitResponse>>.Success(visits.ToResponseList());
    }
}
