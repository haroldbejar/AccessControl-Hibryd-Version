using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Reservations.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Reservations.Commands.ConfirmReservation;

public sealed record ConfirmReservationCommand(int Id) : IRequest<Result<ReservationResponse>>;
