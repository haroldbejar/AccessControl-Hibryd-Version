using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Visits.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Visits.Queries.GetVisitByDocument;

public sealed record GetVisitByDocumentQuery(string DocumentNumber) : IRequest<Result<VisitResponse>>;
