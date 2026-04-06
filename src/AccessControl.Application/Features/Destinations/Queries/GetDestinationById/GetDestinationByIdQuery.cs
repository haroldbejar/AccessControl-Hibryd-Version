using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Destinations.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Destinations.Queries.GetDestinationById;

public sealed record GetDestinationByIdQuery(
    int Id
) : IRequest<Result<DestinationResponse>>;
