using AccessControl.Domain.Enums;

namespace AccessControl.Application.Features.Representatives.Dtos;

public sealed record RepresentativeResponse(
    int Id,
    string Name,
    string? Phone,
    string? CellPhone,
    int DestinationId,
    string DestinationName,
    bool HasVehicle,
    VehicleTypeEnum VehicleTypeId,
    string? Brand,
    string? Model,
    string? Color,
    string? Plate
);
