using AccessControl.Application.Common.Models;
using MediatR;

namespace AccessControl.Application.Features.Representatives.Commands.DeleteRepresentative;

public sealed record DeleteRepresentativeCommand(
    int Id
) : IRequest<Result>;
