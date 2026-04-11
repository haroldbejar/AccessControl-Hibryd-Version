using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Reservations.Dtos;
using AccessControl.Domain.Enums;
using AccessControl.Domain.Exceptions;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Reservations.Commands.CancelReservation;

public sealed class CancelReservationCommandHandler : IRequestHandler<CancelReservationCommand, Result<ReservationResponse>>
{
    private readonly IUnitOfWork _uow;

    public CancelReservationCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<ReservationResponse>> Handle(CancelReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _uow.Reservations.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(Domain.Entities.Reservation), request.Id);

        if (reservation.Status != ReservationStatusEnum.Pending && reservation.Status != ReservationStatusEnum.Confirmed)
            return Result<ReservationResponse>.Failure(
                "Solo se pueden cancelar reservas pendientes o confirmadas.");

        reservation.Status = ReservationStatusEnum.Cancelled;
        reservation.CancellationReason = request.CancellationReason.Trim();

        await _uow.Reservations.UpdateAsync(reservation, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        var updated = await _uow.Reservations.GetByIdAsync(reservation.Id, cancellationToken);
        return Result<ReservationResponse>.Success(updated!.ToResponse());
    }
}
