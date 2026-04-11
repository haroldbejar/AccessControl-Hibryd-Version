namespace AccessControl.Application.Features.Reservations.Dtos;

public sealed record ReservationResponse(
    int Id,
    int CommonAreaId,
    string CommonAreaName,
    int DestinationId,
    string DestinationName,
    int RepresentativeId,
    string RepresentativeName,
    string ReservationDate,
    string StartTime,
    string EndTime,
    int Status,
    string StatusDescription,
    string? Notes,
    string? CancellationReason,
    DateTime CreatedDate
);
