using AccessControl.Application.Common.Models;
using AccessControl.Domain.Entities;
using AccessControl.Domain.Enums;
using AccessControl.Domain.Exceptions;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.CommonAreas.Commands.DeleteCommonArea;

public sealed class DeleteCommonAreaCommandHandler : IRequestHandler<DeleteCommonAreaCommand, Result>
{
    private readonly IUnitOfWork _uow;

    public DeleteCommonAreaCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result> Handle(DeleteCommonAreaCommand request, CancellationToken cancellationToken)
    {
        var area = await _uow.CommonAreas.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(CommonArea), request.Id);

        var activeReservations = await _uow.Reservations.FindAsync(
            r => r.CommonAreaId == request.Id &&
                 (r.Status == ReservationStatusEnum.Pending || r.Status == ReservationStatusEnum.Confirmed),
            cancellationToken);

        if (activeReservations.Any())
            return Result.Failure("No se puede eliminar la zona común porque tiene reservas activas (pendientes o confirmadas).");

        await _uow.CommonAreas.DeleteAsync(area, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
