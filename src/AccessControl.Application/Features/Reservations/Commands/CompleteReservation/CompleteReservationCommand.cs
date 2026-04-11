using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Reservations.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Reservations.Commands.CompleteReservation;

public sealed record CompleteReservationCommand(int Id) : IRequest<Result<ReservationResponse>>;
