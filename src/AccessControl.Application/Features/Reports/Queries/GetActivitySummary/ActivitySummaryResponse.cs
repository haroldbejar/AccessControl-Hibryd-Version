namespace AccessControl.Application.Features.Reports.Queries.GetActivitySummary;

public sealed record ActivitySummaryResponse(
    int TotalVisits,
    int ActiveVisits,
    int VisitsWithVehicle,
    int TotalPackages,
    int PendingPackages,
    int DeliveredPackages,
    DateTime PeriodStart,
    DateTime PeriodEnd
);
