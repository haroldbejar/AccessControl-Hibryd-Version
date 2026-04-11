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
        var current = area.OpeningTime;

        while (current.AddHours(1) <= area.ClosingTime)
        {
            var next = current.AddHours(1);

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

            current = next;
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
