using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Reservations.Dtos;
using AccessControl.Domain.Entities;
using AccessControl.Domain.Enums;
using AccessControl.Domain.Exceptions;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Reservations.Commands.CreateReservation;

public sealed class CreateReservationCommandHandler : IRequestHandler<CreateReservationCommand, Result<ReservationResponse>>
{
    private readonly IUnitOfWork _uow;

    public CreateReservationCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<ReservationResponse>> Handle(CreateReservationCommand request, CancellationToken cancellationToken)
    {
        // Validar que la zona común existe
        var area = await _uow.CommonAreas.GetByIdAsync(request.CommonAreaId, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(CommonArea), request.CommonAreaId);

        // Validar que el destino existe
        _ = await _uow.Destinations.GetByIdAsync(request.DestinationId, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(Destination), request.DestinationId);

        // Validar que el representante existe
        _ = await _uow.Representatives.GetByIdAsync(request.RepresentativeId, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(Representative), request.RepresentativeId);

        // Validar que la reserva se encuentra dentro del horario de la zona
        if (request.StartTime < area.OpeningTime || request.EndTime > area.ClosingTime)
            return Result<ReservationResponse>.Failure(
                $"El horario solicitado ({request.StartTime:HH\\:mm}–{request.EndTime:HH\\:mm}) está fuera del horario de la zona " +
                $"({area.OpeningTime:HH\\:mm}–{area.ClosingTime:HH\\:mm}).");

        // Validar solapamiento con otras reservas
        var hasOverlap = await _uow.Reservations.HasOverlapAsync(
            request.CommonAreaId,
            request.ReservationDate,
            request.StartTime,
            request.EndTime,
            cancellationToken: cancellationToken);

        if (hasOverlap)
            return Result<ReservationResponse>.Failure(
                "Ya existe una reserva en ese horario para la zona común seleccionada.");

        var reservation = new Reservation
        {
            CommonAreaId = request.CommonAreaId,
            DestinationId = request.DestinationId,
            RepresentativeId = request.RepresentativeId,
            ReservationDate = request.ReservationDate,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Status = ReservationStatusEnum.Pending,
            Notes = request.Notes?.Trim(),
            UserCreated = request.UserCreated
        };

        await _uow.Reservations.AddAsync(reservation, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        var created = await _uow.Reservations.GetByIdAsync(reservation.Id, cancellationToken);
        return Result<ReservationResponse>.Success(created!.ToResponse());
    }
}
