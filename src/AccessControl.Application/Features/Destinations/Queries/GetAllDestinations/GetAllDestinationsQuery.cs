using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Destinations.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Destinations.Queries.GetAllDestinations;

public sealed record GetAllDestinationsQuery : IRequest<Result<IEnumerable<DestinationResponse>>>;
