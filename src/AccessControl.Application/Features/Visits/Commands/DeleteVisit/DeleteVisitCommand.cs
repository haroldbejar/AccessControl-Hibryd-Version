using AccessControl.Application.Common.Models;
using MediatR;

namespace AccessControl.Application.Features.Visits.Commands.DeleteVisit;

public sealed record DeleteVisitCommand(int Id, int UserEliminated) : IRequest<Result>;
