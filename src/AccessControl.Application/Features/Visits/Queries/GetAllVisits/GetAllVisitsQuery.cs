using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Visits.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Visits.Queries.GetAllVisits;

public sealed record GetAllVisitsQuery(
    DateTime StartDate,
    DateTime EndDate,
    string? DocumentFilter = null,
    string? NameFilter = null,
    int? DestinationFilter = null
) : IRequest<Result<IEnumerable<VisitResponse>>>;
