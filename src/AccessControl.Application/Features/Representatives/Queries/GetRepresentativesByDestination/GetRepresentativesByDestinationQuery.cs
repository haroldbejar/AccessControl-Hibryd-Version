using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Representatives.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Representatives.Queries.GetRepresentativesByDestination;

public sealed record GetRepresentativesByDestinationQuery(
    int DestinationId
) : IRequest<Result<IEnumerable<RepresentativeResponse>>>;
