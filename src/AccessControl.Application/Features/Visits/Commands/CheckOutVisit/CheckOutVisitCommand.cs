using AccessControl.Application.Common.Models;
using MediatR;

namespace AccessControl.Application.Features.Visits.Commands.CheckOutVisit;

public sealed record CheckOutVisitCommand(
    string DocumentNumber,
    int UserModified
) : IRequest<Result>;
