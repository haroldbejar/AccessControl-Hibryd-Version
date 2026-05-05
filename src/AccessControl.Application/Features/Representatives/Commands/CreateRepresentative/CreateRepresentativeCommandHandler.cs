using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Representatives.Dtos;
using AccessControl.Domain.Entities;
using AccessControl.Domain.Enums;
using AccessControl.Domain.Exceptions;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Representatives.Commands.CreateRepresentative;

public sealed class CreateRepresentativeCommandHandler : IRequestHandler<CreateRepresentativeCommand, Result<RepresentativeResponse>>
{
    private readonly IUnitOfWork _uow;

    public CreateRepresentativeCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<RepresentativeResponse>> Handle(CreateRepresentativeCommand request, CancellationToken cancellationToken)
    {
        // Verificar que el destino existe
        var destination = await _uow.Destinations.GetByIdAsync(request.DestinationId, cancellationToken)
            ?? throw new EntityNotFoundException(nameof(Destination), request.DestinationId);

        var representative = new Representative
        {
            Name = request.Name.Trim(),
            Phone = request.Phone?.Trim(),
            CellPhone = request.CellPhone?.Trim(),
            DestinationId = request.DestinationId,
            HasVehicle = request.HasVehicle,
            VehicleTypeId = (VehicleTypeEnum)(request.VehicleTypeId ?? (int)VehicleTypeEnum.NA),
            Brand = request.Brand?.Trim(),
            Model = request.Model?.Trim(),
            Color = request.Color?.Trim(),
            Plate = request.Plate?.Trim(),
            RepresentativeType = (RepresentativeTypeEnum)request.RepresentativeType,
            ContractEndDate = request.ContractEndDate,
            Destination = destination
        };

        await _uow.Representatives.AddAsync(representative, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return Result<RepresentativeResponse>.Success(RepresentativeMapper.ToResponse(representative));
    }
}
