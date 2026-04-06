using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Destinations.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Destinations.Commands.CreateDestination;

public sealed record CreateDestinationCommand(
    string Name
) : IRequest<Result<DestinationResponse>>;
