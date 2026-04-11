using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Reservations.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Reservations.Commands.CreateReservation;

public sealed record CreateReservationCommand(
    int CommonAreaId,
    int DestinationId,
    int RepresentativeId,
    DateOnly ReservationDate,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string? Notes,
    int UserCreated
) : IRequest<Result<ReservationResponse>>;
