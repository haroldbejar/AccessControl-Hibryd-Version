namespace AccessControl.Application.Features.Reservations.Dtos;

public sealed record AvailabilitySlot(
    string StartTime,
    string EndTime,
    bool IsFree,
    int? ReservationId,
    string? RepresentativeName,
    string? DestinationName,
    int? Status
);
