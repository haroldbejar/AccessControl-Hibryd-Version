using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Visits.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Visits.Queries.GetVisitById;

public sealed record GetVisitByIdQuery(int Id) : IRequest<Result<VisitResponse>>;
