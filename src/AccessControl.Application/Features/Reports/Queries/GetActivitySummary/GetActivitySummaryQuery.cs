using AccessControl.Application.Common.Models;
using MediatR;

namespace AccessControl.Application.Features.Reports.Queries.GetActivitySummary;

public sealed record GetActivitySummaryQuery(
    DateTime StartDate,
    DateTime EndDate
) : IRequest<Result<ActivitySummaryResponse>>;
