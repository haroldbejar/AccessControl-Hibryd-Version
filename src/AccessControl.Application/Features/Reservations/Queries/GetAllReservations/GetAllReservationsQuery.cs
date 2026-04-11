using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Reservations.Dtos;
using AccessControl.Domain.Enums;
using MediatR;

namespace AccessControl.Application.Features.Reservations.Queries.GetAllReservations;

public sealed record GetAllReservationsQuery(
    DateOnly? Date,
    int? CommonAreaId,
    ReservationStatusEnum? Status) : IRequest<Result<IEnumerable<ReservationResponse>>>;
