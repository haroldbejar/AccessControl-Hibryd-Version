using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Representatives.Dtos;
using AccessControl.Domain.Entities;
using AccessControl.Domain.Exceptions;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Representatives.Commands.UpdateRepresentative;

public sealed class UpdateRepresentativeCommandHandler : IRequestHandler<UpdateRepresentativeCommand, Result<RepresentativeResponse>>
{
    private readonly IUnitOfWork _uow;

    public UpdateRepresentativeCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<RepresentativeResponse>> Handle(UpdateRepresentativeCommand request, CancellationToken cancellationToken)
    {
        var representative = await _uow.Representatives.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(Representative), request.Id);

        var destination = await _uow.Destinations.GetByIdAsync(request.DestinationId, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(Destination), request.DestinationId);

        representative.Name = request.Name.Trim();
        representative.Phone = request.Phone?.Trim();
        representative.CellPhone = request.CellPhone?.Trim();
        representative.DestinationId = request.DestinationId;
        representative.Destination = destination;
        representative.HasVehicle = request.HasVehicle;
        representative.VehicleTypeId = request.VehicleTypeId;
        representative.Brand = request.Brand?.Trim();
        representative.Model = request.Model?.Trim();
        representative.Color = request.Color?.Trim();
        representative.Plate = request.Plate?.Trim();

        await _uow.Representatives.UpdateAsync(representative, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return Result<RepresentativeResponse>.Success(RepresentativeMapper.ToResponse(representative));
    }
}
