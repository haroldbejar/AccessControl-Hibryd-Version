using AccessControl.Application.Common.Models;
using MediatR;

namespace AccessControl.Application.Features.Destinations.Commands.DeleteDestination;

public sealed record DeleteDestinationCommand(
    int Id
) : IRequest<Result>;
