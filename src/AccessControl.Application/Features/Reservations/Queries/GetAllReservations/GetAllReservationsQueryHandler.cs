using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Reservations.Dtos;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Reservations.Queries.GetAllReservations;

public sealed class GetAllReservationsQueryHandler : IRequestHandler<GetAllReservationsQuery, Result<IEnumerable<ReservationResponse>>>
{
    private readonly IUnitOfWork _uow;

    public GetAllReservationsQueryHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<IEnumerable<ReservationResponse>>> Handle(GetAllReservationsQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _uow.Reservations.GetAllFilteredAsync(
            request.Date,
            request.CommonAreaId,
            request.Status,
            cancellationToken);

        return Result<IEnumerable<ReservationResponse>>.Success(reservations.ToResponseList());
    }
}
