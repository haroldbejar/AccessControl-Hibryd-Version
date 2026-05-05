using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Representatives.Dtos;
using AccessControl.Domain.Enums;
using MediatR;

namespace AccessControl.Application.Features.Representatives.Commands.CreateRepresentative;

public sealed record CreateRepresentativeCommand(
    string Name,
    string? Phone,
    string? CellPhone,
    int DestinationId,
    bool HasVehicle,
    int? VehicleTypeId,
    string? Brand,
    string? Model,
    string? Color,
    string? Plate,
    int RepresentativeType,
    DateOnly? ContractEndDate
) : IRequest<Result<RepresentativeResponse>>;
