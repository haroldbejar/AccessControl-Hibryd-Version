namespace AccessControl.Application.Features.Reservations.Dtos;

public sealed record AvailabilityResponse(
    int CommonAreaId,
    string CommonAreaName,
    string Date,
    string OpeningTime,
    string ClosingTime,
    IEnumerable<AvailabilitySlot> Slots
);
