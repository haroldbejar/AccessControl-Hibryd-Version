using AccessControl.Application.Features.Reservations.Dtos;
using AccessControl.Domain.Entities;

namespace AccessControl.Application.Common.Mappings;

public static class ReservationMapper
{
    public static ReservationResponse ToResponse(this Reservation r) => new(
        Id: r.Id,
        CommonAreaId: r.CommonAreaId,
        CommonAreaName: r.CommonArea?.Name ?? string.Empty,
        DestinationId: r.DestinationId,
        DestinationName: r.Destination?.Name ?? string.Empty,
        RepresentativeId: r.RepresentativeId,
        RepresentativeName: r.Representative?.Name ?? string.Empty,
        ReservationDate: r.ReservationDate.ToString("yyyy-MM-dd"),
        StartTime: r.StartTime.ToString("HH:mm"),
        EndTime: r.EndTime.ToString("HH:mm"),
        Status: (int)r.Status,
        StatusDescription: r.StatusDescription,
        Notes: r.Notes,
        CancellationReason: r.CancellationReason,
        CreatedDate: r.CreatedDate
    );

    public static IEnumerable<ReservationResponse> ToResponseList(this IEnumerable<Reservation> reservations)
        => reservations.Select(r => r.ToResponse());
}
