using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Reservations.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Reservations.Commands.CancelReservation;

public sealed record CancelReservationCommand(int Id, string CancellationReason) : IRequest<Result<ReservationResponse>>;
