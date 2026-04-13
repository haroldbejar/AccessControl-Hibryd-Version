using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Reservations.Dtos;
using AccessControl.Domain.Exceptions;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Reservations.Queries.GetAvailability;

public sealed class GetAvailabilityQueryHandler : IRequestHandler<GetAvailabilityQuery, Result<AvailabilityResponse>>
{
    private readonly IUnitOfWork _uow;

    public GetAvailabilityQueryHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<AvailabilityResponse>> Handle(GetAvailabilityQuery request, CancellationToken cancellationToken)
    {
        var area = await _uow.CommonAreas.GetByIdAsync(request.CommonAreaId, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(Domain.Entities.CommonArea), request.CommonAreaId);

        var reservations = await _uow.Reservations.GetByDateAndAreaAsync(
            request.Date,
            request.CommonAreaId,
            cancellationToken);

        var slots = new List<AvailabilitySlot>();

        // Usar aritmética entera de minutos para evitar el wrapping de medianoche
        // que causa un loop infinito con TimeOnly.AddHours cuando ClosingTime >= 23:00.
        var currentMinutes = area.OpeningTime.Hour * 60 + area.OpeningTime.Minute;
        var closingMinutes = area.ClosingTime.Hour * 60 + area.ClosingTime.Minute;

        while (currentMinutes + 60 <= closingMinutes)
        {
            var current = new TimeOnly(currentMinutes / 60, currentMinutes % 60);
            var next = new TimeOnly((currentMinutes + 60) / 60, (currentMinutes + 60) % 60);

            var occupying = reservations.FirstOrDefault(
                r => r.StartTime <= current && r.EndTime > current);

            slots.Add(new AvailabilitySlot(
                StartTime: current.ToString("HH:mm"),
                EndTime: next.ToString("HH:mm"),
                IsFree: occupying is null,
                ReservationId: occupying?.Id,
                RepresentativeName: occupying?.Representative?.Name,
                DestinationName: occupying?.Destination?.Name,
                Status: occupying != null ? (int)occupying.Status : null));

            currentMinutes += 60;
        }

        var response = new AvailabilityResponse(
            CommonAreaId: area.Id,
            CommonAreaName: area.Name,
            Date: request.Date.ToString("yyyy-MM-dd"),
            OpeningTime: area.OpeningTime.ToString("HH:mm"),
            ClosingTime: area.ClosingTime.ToString("HH:mm"),
            Slots: slots);

        return Result<AvailabilityResponse>.Success(response);
    }
}
