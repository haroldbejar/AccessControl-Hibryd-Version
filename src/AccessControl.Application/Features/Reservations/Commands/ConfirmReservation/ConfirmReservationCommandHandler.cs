using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Reservations.Dtos;
using AccessControl.Domain.Enums;
using AccessControl.Domain.Exceptions;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Reservations.Commands.ConfirmReservation;

public sealed class ConfirmReservationCommandHandler : IRequestHandler<ConfirmReservationCommand, Result<ReservationResponse>>
{
    private readonly IUnitOfWork _uow;

    public ConfirmReservationCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<ReservationResponse>> Handle(ConfirmReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _uow.Reservations.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(Domain.Entities.Reservation), request.Id);

        if (reservation.Status != ReservationStatusEnum.Pending)
            return Result<ReservationResponse>.Failure("Solo se pueden confirmar reservas pendientes.");

        reservation.Status = ReservationStatusEnum.Confirmed;

        await _uow.Reservations.UpdateAsync(reservation, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        var updated = await _uow.Reservations.GetByIdAsync(reservation.Id, cancellationToken);
        return Result<ReservationResponse>.Success(updated!.ToResponse());
    }
}
