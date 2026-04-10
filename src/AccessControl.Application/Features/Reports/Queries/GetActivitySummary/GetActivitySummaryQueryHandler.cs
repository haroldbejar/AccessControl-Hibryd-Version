using AccessControl.Application.Common.Models;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Reports.Queries.GetActivitySummary;

public sealed class GetActivitySummaryQueryHandler
    : IRequestHandler<GetActivitySummaryQuery, Result<ActivitySummaryResponse>>
{
    private readonly IUnitOfWork _uow;

    public GetActivitySummaryQueryHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<ActivitySummaryResponse>> Handle(
        GetActivitySummaryQuery request, CancellationToken cancellationToken)
    {
        var visits = (await _uow.Visits.GetAllFilteredAsync(
            request.StartDate,
            request.EndDate,
            null, null, null,
            cancellationToken)).ToList();

        var packages = (await _uow.Packages.GetAllFilteredAsync(
            request.StartDate,
            request.EndDate,
            null, null, null, null,
            cancellationToken)).ToList();

        var response = new ActivitySummaryResponse(
            TotalVisits: visits.Count,
            ActiveVisits: visits.Count(v => v.CheckOut == null),
            VisitsWithVehicle: visits.Count(v => v.HasVehicle),
            TotalPackages: packages.Count,
            PendingPackages: packages.Count(p => p.Status == Domain.Enums.PackagesStatusEnum.Received),
            DeliveredPackages: packages.Count(p => p.Status == Domain.Enums.PackagesStatusEnum.Delivered),
            PeriodStart: request.StartDate,
            PeriodEnd: request.EndDate
        );

        return Result<ActivitySummaryResponse>.Success(response);
    }
}
